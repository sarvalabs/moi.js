"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const events_1 = require("events");
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const interaction_response_1 = require("../utils/interaction-response");
class JsonRpcProvider extends events_1.EventEmitter {
    _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport) {
        super();
        if (transport == null) {
            js_moi_utils_1.ErrorUtils.throwError("Transport is required", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
                encodedIxArgs = (0, js_moi_utils_1.bytesToHex)(ix);
                break;
            }
            case typeof ix === "object": {
                if (!("fuel_limit" in ix)) {
                    console.warn("Simulating interaction should not take a fuel limit.\nFor simulation, fuel limit not provided. Using default value 1.");
                    ix["fuel_limit"] = 1;
                }
                const result = (0, js_moi_utils_1.validateIxRequest)("moi.Simulate", ix);
                if (result != null) {
                    js_moi_utils_1.ErrorUtils.throwError(`Invalid interaction request: ${result.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, { ...result });
                }
                encodedIxArgs = (0, js_moi_utils_1.bytesToHex)((0, js_moi_utils_1.interaction)(ix));
                break;
            }
            case typeof ix === "string": {
                if (!(0, js_moi_utils_1.isHex)(ix)) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix);
                }
                encodedIxArgs = ix;
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
            case identifier instanceof js_moi_identifiers_1.Identifier && typeof height === "number" && isValidOption(option): {
                // Getting tesseract by address and height
                if (Number.isNaN(height) || height < -1) {
                    js_moi_utils_1.ErrorUtils.throwError("Invalid height value", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                return await this.getTesseractByReference({ relative: { identifier: identifier.toHex(), height } }, option);
            }
            case typeof identifier === "object" && !(identifier instanceof js_moi_identifiers_1.Identifier) && isValidOption(height): {
                // Getting tesseract by reference
                return await this.getTesseractByReference(identifier, height);
            }
            case (0, js_moi_utils_1.isHex)(identifier) && isValidOption(height): {
                // Getting tesseract by hash
                return await this.getTesseractByReference({ absolute: identifier }, height);
            }
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid arguments passed to get correct method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    getLogic(identifier, option) {
        return this.call("moi.Logic", { identifier: identifier.toHex(), ...option });
    }
    async getLogicStorage(logic, participantOrStorage, storageId, option) {
        let params;
        switch (true) {
            case (0, js_moi_utils_1.isHex)(participantOrStorage) || participantOrStorage instanceof js_moi_utils_1.StorageKey: {
                // getting value from persistent storage
                params = [{ logic_id: logic.toHex(), storage_id: participantOrStorage instanceof js_moi_utils_1.StorageKey ? participantOrStorage.hex() : participantOrStorage, ...option }];
                break;
            }
            case participantOrStorage instanceof js_moi_identifiers_1.Identifier: {
                // getting value from ephemeral storage
                if (storageId == null) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Storage key is required", "storageId", storageId);
                }
                if (!(storageId instanceof js_moi_utils_1.StorageKey) && !(0, js_moi_utils_1.isHex)(storageId)) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Storage key must be a valid hex string or StorageKey instance", "storageId", storageId);
                }
                const storageIdHex = storageId instanceof js_moi_utils_1.StorageKey ? storageId.hex() : storageId;
                params = [{ logic_id: logic.toHex(), address: participantOrStorage.toHex(), storage_id: storageIdHex, ...option }];
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid arguments passed to get correct method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
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
                const polorizer = new js_polo_1.Polorizer();
                polorizer.polorizeString(topic);
                encodedTopics[i] = (0, js_moi_utils_1.hexToHash)(polorizer.bytes());
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
            js_moi_utils_1.ErrorUtils.throwArgumentError("Must be a non-negative integer", "index", index);
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
                    js_moi_utils_1.ErrorUtils.throwError("No signatures provided", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                params = [{ interaction: (0, js_moi_utils_1.bytesToHex)(ix), signatures }];
                break;
            }
            case typeof ix === "object": {
                if (ix.interaction == null) {
                    js_moi_utils_1.ErrorUtils.throwError("No interaction provided", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                if (!ix.signatures || !Array.isArray(ix.signatures)) {
                    js_moi_utils_1.ErrorUtils.throwError("No signatures provided", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                params = [ix];
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
        }
        const hash = await this.call("moi.Execute", ...params);
        return new interaction_response_1.InteractionResponse(hash, this);
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
            js_moi_utils_1.ErrorUtils.throwError(response.error.message, response.error.code, params);
        }
        return response.result;
    }
}
exports.JsonRpcProvider = JsonRpcProvider;
//# sourceMappingURL=json-rpc-provider.js.map