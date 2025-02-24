import { Identifier } from "js-moi-identifiers";
import type { LogicMessageRequestOption, SimulateInteractionRequest, TimerOption } from "js-moi-providers";
import type { Signer, SignerIx } from "js-moi-signer";
import { LogicState, OpType, RoutineType, StorageKey, type Hex, type InteractionRequest, type IxOperation, type LogicManifest, type LogicMessage } from "js-moi-utils";
import { LogicDescriptor } from "./logic-descriptor";
import type { LogicCallsites, LogicDriverOption, StateAccessorFn } from "./types";
/**
 * It is class that is used to interact with the logic.
 *
 * @class LogicDriver
 */
export declare class LogicDriver<TCallsites extends LogicCallsites = LogicCallsites> extends LogicDescriptor {
    private signer;
    readonly endpoint: TCallsites;
    private deployIxResponse?;
    constructor(option: Omit<LogicDriverOption, "logicId"> & {
        logicId?: Identifier;
    });
    /**
     * Checks if the logic has been deployed.
     *
     * This method attempts to retrieve the logic ID. If the logic ID is successfully
     * retrieved, it indicates that the logic has been deployed. If an error occurs
     * during the retrieval, it is assumed that the logic has not been deployed.
     *
     * @returns A promise that resolves to `true` if the logic is deployed, otherwise `false`.
     */
    isDeployed(): Promise<boolean>;
    /**
     * Retrieves the type of a callsite.
     *
     * @param callsite - The name of the callsite.
     * @returns The type of the specified callsite.
     */
    getCallsiteType(callsite: string): RoutineType;
    /**
     * Determines if the callsite is mutable based on its routine kind.
     *
     * @param callsite - The identifier of the callsite to check.
     * @returns A boolean indicating whether the callsite is mutable.
     */
    isCallsiteMutable(callsite: string): boolean;
    private extractArgsAndOption;
    /**
     * Creates an interaction operation for the specified callsite.
     *
     * @param callsite - The name of the callsite.
     * @param args - The arguments to pass to the callsite.
     * @returns A promise that resolves to an interaction operation.
     *
     * @throws an error if the callsite is not present.
     */
    createIxOperation(callsite: string, args: unknown[]): Promise<IxOperation<OpType.LogicDeploy> | IxOperation<OpType.LogicInvoke> | IxOperation<OpType.LogicEnlist>>;
    /**
     * Creates an interaction request for a given callsite and its arguments.
     *
     * @param callsite - The name of the callsite function to be invoked.
     * @param callsiteArguments - An array of arguments to be passed to the callsite function.
     * @param option - Optional parameters for the callsite, including fuel price and fuel limit.
     * @returns A promise that resolves to a SignerIx object, which can be either a SimulateInteractionRequest or an InteractionRequest.
     *
     * @throws Will throw an error if the provided fuel limit is less than the required simulation effort.
     */
    createIxRequest(method: "moi.Simulate", callsite: string, callsiteArguments: unknown[], params?: Omit<Partial<SignerIx<SimulateInteractionRequest>>, "operations">): Promise<SimulateInteractionRequest>;
    createIxRequest(method: "moi.Execute", callsite: string, callsiteArguments: unknown[], params?: Omit<Partial<SignerIx<InteractionRequest>>, "operations">): Promise<InteractionRequest>;
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
    getLogicId(timer?: TimerOption): Promise<Identifier>;
    private newCallsite;
    private setupEndpoint;
    /**
     * Retrieves the logic storage based on the provided state and storage key.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param storageKey - The key used to access the storage, can be of type StorageKey or Hex.
     * @returns A promise that resolves to the logic storage data.
     *
     * @throws Will throw an error if the logic state is invalid.
     */
    getLogicStorage(state: LogicState, storageKey: StorageKey | Hex): Promise<`0x${string}`>;
    /**
     * Retrieves the storage key for the provided state and accessor.
     *
     * @param state - The state of the logic storage, either Persistent or Ephemeral.
     * @param accessor - The accessor used to generate the storage key.
     * @returns The storage key for the provided state and accessor.
     */
    getStorageKey(state: LogicState, accessor: StateAccessorFn): StorageKey;
    private getLogicStateValue;
    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the persistent storage.
     * @returns A promise that resolves to the persistent storage data in POLO encoding.
     */
    persistent(storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the persistent storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the persistent storage decoded value.
     */
    persistent<T>(accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param storageKey - The storage key used to access the ephemeral storage.
     * @returns A promise that resolves to the ephemeral storage data in POLO encoding.
     */
    ephemeral(storageKey: StorageKey | Hex): Promise<Hex>;
    /**
     * Retrieves the ephemeral storage value based on the provided accessor.
     *
     * @param accessor - The accessor used to generate the storage key.
     * @returns A promise that resolves to the ephemeral storage decoded value.
     */
    ephemeral<T>(accessor: StateAccessorFn): Promise<T>;
    /**
     * Retrieves logic messages based on the provided options.
     *
     * @param {LogicMessageRequestOption} [option] - Optional parameter to specify the request options for logic messages.
     * @returns {Promise<LogicMessage[]>} A promise that resolves to an array of logic messages.
     */
    getLogicMessages(option?: LogicMessageRequestOption): Promise<LogicMessage[]>;
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
export declare const getLogicDriver: <TCallsites extends LogicCallsites = LogicCallsites>(logicId: Identifier | LogicManifest, signer: Signer) => Promise<LogicDriver<TCallsites>>;
//# sourceMappingURL=logic-driver.d.ts.map