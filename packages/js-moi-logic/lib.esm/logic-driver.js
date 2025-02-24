import { isIdentifier, LogicId } from "js-moi-identifiers";
import { isPrimitiveType, ManifestCoder, ManifestCoderFormat, Schema } from "js-moi-manifest";
import { ElementType, ErrorCode, ErrorUtils, generateStorageKey, hexToBytes, isHex, LogicState, OpType, RoutineKind, RoutineType, StorageKey, } from "js-moi-utils";
import { Depolorizer } from "js-polo";
import { LogicDescriptor } from "./logic-descriptor";
import { SlotAccessorBuilder } from "./state/accessor-builder";
import { StateAccessorBuilder } from "./state/state-accessor-builder";
/**
 * It is class that is used to interact with the logic.
 *
 * @class LogicDriver
 */
export class LogicDriver extends LogicDescriptor {
    signer;
    endpoint;
    deployIxResponse;
    constructor(option) {
        if (option.signer == null) {
            ErrorUtils.throwError("Signer is required.", ErrorCode.INVALID_ARGUMENT);
        }
        super(option.manifest, option.logicId);
        this.signer = option.signer;
        this.endpoint = this.setupEndpoint();
    }
    /**
     * Checks if the logic has been deployed.
     *
     * This method attempts to retrieve the logic ID. If the logic ID is successfully
     * retrieved, it indicates that the logic has been deployed. If an error occurs
     * during the retrieval, it is assumed that the logic has not been deployed.
     *
     * @returns A promise that resolves to `true` if the logic is deployed, otherwise `false`.
     */
    async isDeployed() {
        const logicId = await this.getLogicId().catch(() => null);
        return logicId != null;
    }
    /**
     * Retrieves the type of a callsite.
     *
     * @param callsite - The name of the callsite.
     * @returns The type of the specified callsite.
     */
    getCallsiteType(callsite) {
        return this.getRoutineElement(callsite).data.kind;
    }
    /**
     * Determines if the callsite is mutable based on its routine kind.
     *
     * @param callsite - The identifier of the callsite to check.
     * @returns A boolean indicating whether the callsite is mutable.
     */
    isCallsiteMutable(callsite) {
        const kinds = [RoutineKind.Ephemeral, RoutineKind.Persistent];
        const element = this.getRoutineElement(callsite);
        return kinds.includes(element.data.mode);
    }
    extractArgsAndOption(callsite, callsiteArguments) {
        const element = this.getRoutineElement(callsite);
        if (callsiteArguments.length < element.data.accepts.length) {
            const callsiteSignature = `Invalid number of arguments: ${callsite}(${element.data.accepts.map((accept) => `${accept.label} ${accept.type}`).join(", ")})`;
            ErrorUtils.throwArgumentError(callsiteSignature, "args", callsiteArguments);
        }
        const option = callsiteArguments.at(element.data.accepts.length);
        const args = callsiteArguments.slice(0, element.data.accepts.length);
        return { option, args };
    }
    /**
     * Creates an interaction operation for the specified callsite.
     *
     * @param callsite - The name of the callsite.
     * @param args - The arguments to pass to the callsite.
     * @returns A promise that resolves to an interaction operation.
     *
     * @throws an error if the callsite is not present.
     */
    async createIxOperation(callsite, args) {
        const routine = this.getRoutineElement(callsite);
        if (routine.data.accepts.length !== args.length) {
            ErrorUtils.throwError(`Invalid number of arguments for callsite "${callsite}".`, ErrorCode.INVALID_ARGUMENT);
        }
        const calldata = this.getManifestCoder().encodeArguments(callsite, ...args);
        const callsiteType = this.getCallsiteType(callsite);
        switch (callsiteType) {
            case RoutineType.Deploy: {
                return {
                    type: OpType.LogicDeploy,
                    payload: { manifest: this.getManifest(ManifestCoderFormat.POLO), callsite, calldata },
                };
            }
            case RoutineType.Invoke:
            case RoutineType.Enlist: {
                const logicId = await this.getLogicId();
                return {
                    type: callsiteType === RoutineType.Invoke ? OpType.LogicInvoke : OpType.LogicEnlist,
                    payload: { logic_id: logicId.toHex(), callsite, calldata },
                };
            }
            default: {
                ErrorUtils.throwError("Invalid routine type.", ErrorCode.INVALID_ARGUMENT);
            }
        }
    }
    async createIxRequest(method, callsite, callsiteArguments, params) {
        const operation = await this.createIxOperation(callsite, callsiteArguments);
        if (method === "moi.Simulate") {
            return await this.signer.createIxRequest("moi.Simulate", {
                ...params,
                operations: [operation],
            });
        }
        return await this.signer.createIxRequest("moi.Execute", {
            ...params,
            operations: [operation],
        });
    }
    /**
     * Retrieves the logic ID associated with this instance. If the logic ID is already set, it returns the existing logic ID.
     *
     * - If the logic ID is not set but a deployment response is available, it processes the deployment response to extract and set the logic ID.
     * - If the deployment response contains an error or an unexpected result type, it throws an appropriate error.
     *
     * @param timer a optional timer to wait for the result.
     * @returns A promise that resolves to the logic ID.
     *
     * @throws If the logic id not deployed.
     * @throws If error occurs during the deployment process.
     */
    async getLogicId(timer) {
        if (this.deployIxResponse != null) {
            const results = await this.deployIxResponse.result(timer);
            const result = results.at(0);
            if (result?.type !== OpType.LogicDeploy) {
                ErrorUtils.throwError("Expected result of logic deploy got something else.", ErrorCode.UNKNOWN_ERROR);
            }
            const exception = ManifestCoder.decodeException(result.data.error);
            if (exception != null) {
                ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
            }
            this.setLogicId(new LogicId(result.data.logic_id));
        }
        return super.getLogicId();
    }
    newCallsite(callsite) {
        const isDeployerCallsite = this.getCallsiteType(callsite) === RoutineType.Deploy;
        const callback = async (...args) => {
            const isDeployed = await this.isDeployed();
            if (isDeployerCallsite && isDeployed) {
                ErrorUtils.throwError(`Logic is already deployed or deploying.`);
            }
            if (!isDeployerCallsite && !isDeployed) {
                ErrorUtils.throwError(`Logic is not deployed, deploy it first using deployer callsites.`);
            }
            const { option, args: callsiteArgs } = this.extractArgsAndOption(callsite, args);
            if (!this.isCallsiteMutable(callsite)) {
                const simulateIxRequest = await this.createIxRequest("moi.Simulate", callsite, callsiteArgs, option);
                const simulation = await this.signer.simulate(simulateIxRequest);
                const result = simulation.results.at(0);
                if (result?.type !== OpType.LogicInvoke) {
                    ErrorUtils.throwError("Expected LogicInvoke operation.", ErrorCode.UNKNOWN_ERROR);
                }
                const { error, outputs } = result.data;
                const exception = ManifestCoder.decodeException(error);
                if (exception != null) {
                    ErrorUtils.throwError(exception.error, ErrorCode.CALL_EXCEPTION, exception);
                }
                return this.getManifestCoder().decodeOutput(callsite, outputs);
            }
            const request = await this.createIxRequest("moi.Execute", callsite, callsiteArgs, option);
            const response = await this.signer.execute(request);
            if (isDeployerCallsite) {
                this.deployIxResponse = response;
            }
            return response;
        };
        return callback;
    }
    setupEndpoint() {
        const endpoint = {};
        for (const { ptr } of this.getCallsites().values()) {
            const element = this.getElement(ptr);
            if (element.kind !== ElementType.Routine) {
                ErrorUtils.throwError(`Element at "${ptr}" is not a valid callsite.`);
            }
            endpoint[element.data.name] = this.newCallsite(element.data.name);
        }
        return Object.freeze(endpoint);
    }
    /**
     * Retrieves the logic storage based on the provided state and storage key.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey - The key used to access the storage, can be of type StorageKey or Hex.
     * @returns A promise that resolves to the logic storage data.
     *
     * @throws Will throw an error if the logic state is invalid.
     */
    async getLogicStorage(state, storageKey) {
        const logicId = await this.getLogicId();
        switch (state) {
            case LogicState.Persistent: {
                return await this.signer.getProvider().getLogicStorage(logicId, storageKey);
            }
            case LogicState.Ephemeral: {
                const identifier = await this.signer.getIdentifier();
                return await this.signer.getProvider().getLogicStorage(logicId, identifier, storageKey);
            }
            default:
                ErrorUtils.throwError("Invalid logic state.", ErrorCode.INVALID_ARGUMENT);
        }
    }
    /**
     * Retrieves the storage key for the provided state and accessor.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param accessor - The accessor used to generate the storage key.
     * @returns The storage key for the provided state and accessor.
     */
    getStorageKey(state, accessor) {
        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));
        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }
        return generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
    }
    async getLogicStateValue(state, accessor) {
        if (accessor instanceof StorageKey || isHex(accessor)) {
            return await this.getLogicStorage(state, accessor);
        }
        const element = this.getStateElement(state);
        const builder = accessor(new StateAccessorBuilder(element.ptr, this));
        if (!(builder instanceof SlotAccessorBuilder)) {
            ErrorUtils.throwError("Invalid accessor builder.", ErrorCode.UNKNOWN_ERROR);
        }
        const key = generateStorageKey(builder.getBaseSlot(), builder.getAccessors());
        const value = await this.getLogicStorage(state, key);
        if (!isPrimitiveType(builder.getStorageType())) {
            return new Depolorizer(hexToBytes(value)).depolorizeInteger();
        }
        const schema = Schema.parseDataType(builder.getStorageType(), this.getClassDefs(), this.getElements());
        return new Depolorizer(hexToBytes(value)).depolorize(schema);
    }
    /**
     * Retrieves the persistent storage value based on the provided accessor or storage key.
     *
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the persistent storage data in POLO encoding or decoded value.
     */
    async persistent(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Persistent, accessor);
        }
        return await this.getLogicStateValue(LogicState.Persistent, accessor);
    }
    /**
     * Retrieves the ephemeral storage value based on the provided accessor or storage key.
     * @param accessor - This can storage key or accessor function.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding or decoded value.
     */
    async ephemeral(accessor) {
        if (typeof accessor === "function") {
            return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
        }
        return await this.getLogicStateValue(LogicState.Ephemeral, accessor);
    }
    /**
     * Retrieves logic messages based on the provided options.
     *
     * @param {LogicMessageRequestOption} [option] - Optional parameter to specify the request options for logic messages.
     * @returns {Promise<LogicMessage[]>} A promise that resolves to an array of logic messages.
     */
    async getLogicMessages(option) {
        const provider = this.signer.getProvider();
        return await provider.getLogicMessage(await this.getLogicId(), option);
    }
}
/**
 * Retrieves a LogicDriver instance for the given logic ID.
 *
 * @param logicId - The ID of the logic to retrieve.
 * @param signer - The signer object used to interact with the logic.
 * @returns A promise that resolves to a LogicDriver instance.
 *
 * @throws Will throw an error if the provider fails to retrieve the logic.
 */
export const getLogicDriver = async (logicId, signer) => {
    if (isIdentifier(logicId)) {
        const provider = signer.getProvider();
        const manifestInPolo = await provider.getLogic(logicId, {
            modifier: { extract: "manifest" },
        });
        const manifest = ManifestCoder.decodeManifest(manifestInPolo, ManifestCoderFormat.JSON);
        return new LogicDriver({ manifest, logicId, signer });
    }
    return new LogicDriver({ manifest: logicId, signer });
};
//# sourceMappingURL=logic-driver.js.map