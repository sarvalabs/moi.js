import { EventEmitter } from "events";
import { Identifier } from "js-moi-identifiers";
import { bytesToHex, ErrorCode, ErrorUtils, hexToHash, interaction, isHex, StorageKey, validateIxRequest, } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { InteractionResponse } from "../utils/interaction-response";
export class JsonRpcProvider extends EventEmitter {
    _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport) {
        super();
        if (transport == null) {
            ErrorUtils.throwError("Transport is required", ErrorCode.INVALID_ARGUMENT);
        }
        this._transport = transport;
    }
    /**
     * The transport used to communicate with the network.
     */
    get transport() {
        return this._transport;
    }
    /**
     * Calls a JSON-RPC method on the network using the `request` method and processes the response.
     *
     * @param method - The name of the method to invoke.
     * @param params - The parameters to pass to the method.
     *
     * @returns A promise that resolves processed result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    async call(method, ...params) {
        const response = await this.request(method, params);
        return this.processJsonRpcResponse(response);
    }
    /**
     * Sends a JSON-RPC request to the network.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    async request(method, params = []) {
        return await this.transport.request(method, params);
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    async getNetworkInfo(option) {
        return await this.call("moi.Protocol", option);
    }
    async simulate(ix, option) {
        let encodedIxArgs;
        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = bytesToHex(ix);
                break;
            }
            case typeof ix === "object": {
                if (!("fuel_limit" in ix)) {
                    console.warn("Simulating interaction should not take a fuel limit.\nFor simulation, fuel limit not provided. Using default value 1.");
                    ix["fuel_limit"] = 1;
                }
                const result = validateIxRequest("moi.Simulate", ix);
                if (result != null) {
                    ErrorUtils.throwError(`Invalid interaction request: ${result.message}`, ErrorCode.INVALID_ARGUMENT, { ...result });
                }
                encodedIxArgs = bytesToHex(interaction(ix));
                break;
            }
            case typeof ix === "string": {
                if (!isHex(ix)) {
                    ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix);
                }
                encodedIxArgs = ix;
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }
        return await this.call("moi.Simulate", {
            interaction: encodedIxArgs,
            ...option,
        });
    }
    async getAccount(participant, option) {
        return await this.call("moi.Account", { identifier: participant.toHex(), ...option });
    }
    async getTesseractByReference(reference, option) {
        return await this.call("moi.Tesseract", {
            reference: reference,
            ...option,
        });
    }
    async getTesseract(identifier, height, option) {
        const isValidOption = (option) => typeof option === "undefined" || typeof option === "object";
        switch (true) {
            case identifier instanceof Identifier && typeof height === "number" && isValidOption(option): {
                // Getting tesseract by address and height
                if (Number.isNaN(height) || height < -1) {
                    ErrorUtils.throwError("Invalid height value", ErrorCode.INVALID_ARGUMENT);
                }
                return await this.getTesseractByReference({ relative: { identifier: identifier.toHex(), height } }, option);
            }
            case typeof identifier === "object" && !(identifier instanceof Identifier) && isValidOption(height): {
                // Getting tesseract by reference
                return await this.getTesseractByReference(identifier, height);
            }
            case isHex(identifier) && isValidOption(height): {
                // Getting tesseract by hash
                return await this.getTesseractByReference({ absolute: identifier }, height);
            }
        }
        ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
    }
    getLogic(identifier, option) {
        return this.call("moi.Logic", { identifier: identifier.toHex(), ...option });
    }
    async getLogicStorage(logic, participantOrStorage, storageId, option) {
        let params;
        switch (true) {
            case isHex(participantOrStorage) || participantOrStorage instanceof StorageKey: {
                // getting value from persistent storage
                params = [{ logic_id: logic.toHex(), storage_id: participantOrStorage instanceof StorageKey ? participantOrStorage.hex() : participantOrStorage, ...option }];
                break;
            }
            case participantOrStorage instanceof Identifier: {
                // getting value from ephemeral storage
                if (storageId == null) {
                    ErrorUtils.throwArgumentError("Storage key is required", "storageId", storageId);
                }
                if (!(storageId instanceof StorageKey) && !isHex(storageId)) {
                    ErrorUtils.throwArgumentError("Storage key must be a valid hex string or StorageKey instance", "storageId", storageId);
                }
                const storageIdHex = storageId instanceof StorageKey ? storageId.hex() : storageId;
                params = [{ logic_id: logic.toHex(), address: participantOrStorage.toHex(), storage_id: storageIdHex, ...option }];
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid arguments passed to get correct method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }
        return await this.call("moi.LogicStorage", ...params);
    }
    async getAsset(asset, option) {
        return await this.call("moi.Asset", { identifier: asset.toHex(), ...option });
    }
    encodeTopics(topics) {
        const encodedTopics = Array.from({ length: topics.length });
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            if (typeof topic === "string") {
                const polorizer = new Polorizer();
                polorizer.polorizeString(topic);
                encodedTopics[i] = hexToHash(polorizer.bytes());
                continue;
            }
            encodedTopics[i] = this.encodeTopics(topic);
        }
        return encodedTopics;
    }
    async getLogicMessage(logic, options) {
        return await this.call("moi.LogicMessage", { logic_id: logic.toHex(), ...options, topics: options?.topics == null ? undefined : this.encodeTopics(options.topics) });
    }
    async getAccountAsset(participant, asset, option) {
        return await this.call("moi.AccountAsset", { identifier: participant.toHex(), asset_id: asset.toHex(), ...option });
    }
    async getAccountKey(participant, index, option) {
        if (Number.isNaN(index) || index < 0) {
            ErrorUtils.throwArgumentError("Must be a non-negative integer", "index", index);
        }
        return await this.call("moi.AccountKey", {
            identifier: participant.toHex(),
            key_idx: index,
            ...option,
        });
    }
    async execute(ix, signatures) {
        let params;
        switch (true) {
            case ix instanceof Uint8Array: {
                if (!signatures || !Array.isArray(signatures)) {
                    ErrorUtils.throwError("No signatures provided", ErrorCode.INVALID_ARGUMENT);
                }
                params = [{ interaction: bytesToHex(ix), signatures }];
                break;
            }
            case typeof ix === "object": {
                if (ix.interaction == null) {
                    ErrorUtils.throwError("No interaction provided", ErrorCode.INVALID_ARGUMENT);
                }
                if (!ix.signatures || !Array.isArray(ix.signatures)) {
                    ErrorUtils.throwError("No signatures provided", ErrorCode.INVALID_ARGUMENT);
                }
                params = [ix];
                break;
            }
            default: {
                ErrorUtils.throwError("Invalid argument for method signature", ErrorCode.INVALID_ARGUMENT);
            }
        }
        const hash = await this.call("moi.Execute", ...params);
        return new InteractionResponse(hash, this);
    }
    getInteraction(hash, option) {
        return this.call("moi.Interaction", { hash, ...option });
    }
    async subscribe(event, params) {
        throw new Error("Method not implemented. Return type needs to be updated");
        // return await this.call("moi.Subscribe", event, params);
    }
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    processJsonRpcResponse(response) {
        if ("error" in response) {
            const { data } = response.error;
            const params = data ? (typeof data === "object" ? data : { data }) : {};
            ErrorUtils.throwError(response.error.message, response.error.code, params);
        }
        return response.result;
    }
}
//# sourceMappingURL=json-rpc-provider.js.map