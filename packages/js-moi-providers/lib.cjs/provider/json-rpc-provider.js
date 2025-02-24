"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcProvider = void 0;
const events_1 = require("events");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const interaction_response_1 = require("../utils/interaction-response");
/**
 * A provider that communicates with the MOI protocol network using JSON-RPC.
 *
 * @extends EventEmitter
 * @implements Provider
 *
 * @param {Transport} transport - The transport to use for communication with the network.
 */
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
        this._transport.on("debug", (data) => this.emit("debug", data));
    }
    /**
     * The transport used to communicate with the network.
     */
    get transport() {
        return this._transport;
    }
    async call(method, ...params) {
        const response = await this.request(method, params);
        return this.processJsonRpcResponse(response);
    }
    /**
     * Sends a JSON-RPC request to the network. This method is used internally
     * to send requests to the network.
     *
     * Developers can use this method to send custom requests to the network that
     * are supported by ``Provider``. Please refer to the `MOI protocol documentation <https://docs.moi.technology/docs/build/json-rpc/>`_
     * for a list of supported methods.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const version = await provider.request("moi.Protocol", {
     *      modifier: { extract: "version" }
     * });
     *
     * console.log(response);
     *
     * >>> { jsonrpc: "2.0", id: "2fb48ce4-3d38-45e4-87a5-0aa9d3d70299", result: "0.12.0" }
     */
    async request(method, params = []) {
        const response = await this.transport.request(method, params);
        return response;
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const version = await provider.getNetworkInfo({
     *    modifier: { extract: "version" },
     * });
     *
     * console.log(version);
     *
     * >>> "0.12.0"
     */
    async getNetworkInfo(option) {
        return await this.call("moi.Protocol", option);
    }
    /**
     * Simulates an interaction on the MOI network.
     *
     * @param ix - interaction object or POLO encoded interaction to simulate.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the result of the simulation.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const result = await provider.simulate({
     *     sender: {
     *         address: "0x...fff",
     *         key_id: 0,
     *         sequence_id: 0,
     *     },
     *     fuel_price: 1,
     *     operations: [
     *         {
     *             type: OpType.AssetCreate,
     *             payload: {
     *                 standard: AssetStandard.MAS0,
     *                 supply: 1000,
     *                 symbol: "TST",
     *             },
     *         },
     *     ],
     * });
     *
     * console.log(result);
     */
    async simulate(ix, option) {
        let encodedIxArgs;
        switch (true) {
            case ix instanceof Uint8Array: {
                encodedIxArgs = (0, js_moi_utils_1.bytesToHex)(ix);
                break;
            }
            case typeof ix === "object": {
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
    /**
     * Retrieves an account from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const account = await provider.getAccount("0x..123");
     *
     * console.log(account);
     */
    async getAccount(participant, option) {
        return await this.call("moi.Account", { id: new js_moi_identifiers_1.Identifier(participant), ...option });
    }
    async getTesseractByReference(reference, option) {
        return await this.call("moi.Tesseract", {
            reference: reference,
            ...option,
        });
    }
    /**
     * Retrieves a tesseract from the MOI network.
     *
     * This is polymorphic method that can accept different combinations of arguments to retrieve a tesseract.
     *
     * @returns A promise that resolves to the tesseract information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * // Get tesseract by address and height
     * const tesseract = await provider.getTesseract("0x...123", 10);
     *
     * console.log(tesseract);
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * // Get tesseract by tesseract hash
     * const tesseract = await provider.getTesseract("0x...123");
     *
     * console.log(tesseract);
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * // Get tesseract by reference modifier
     * const tesseract = await provider.getTesseract({
     *     relative: { id: "0x...123", height: 10 },
     * });
     *
     * console.log(tesseract);
     */
    async getTesseract(identifier, height, option) {
        const isValidOption = (option) => typeof option === "undefined" || typeof option === "object";
        switch (true) {
            case ((0, js_moi_identifiers_1.isIdentifier)(identifier) || (0, js_moi_utils_1.isHex)(identifier, 32)) && typeof height === "number" && isValidOption(option): {
                // Getting tesseract by address and height
                if (Number.isNaN(height) || height < -1) {
                    js_moi_utils_1.ErrorUtils.throwError("Invalid height value", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                return await this.getTesseractByReference({ relative: { id: new js_moi_identifiers_1.Identifier(identifier), height } }, option);
            }
            case typeof identifier === "object" && !(0, js_moi_identifiers_1.isIdentifier)(identifier) && isValidOption(height): {
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
    /**
     * Retrieves a logic from the MOI network.
     *
     * @param identifier - The identifier of the logic to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the logic information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const manifest = await provider.getLogic("0x..123", {
     *     modifier: { extract: "manifest" },
     * });
     *
     * console.log(manifest);

     */
    getLogic(identifier, option) {
        return this.call("moi.Logic", { id: new js_moi_identifiers_1.Identifier(identifier), ...option });
    }
    /**
     * Retrieves the storage value of a logic from the MOI network.
     *
     * This is a polymorphic method that can accept different combinations of arguments to retrieve a logic storage value.
     *
     * @returns A promise that resolves to the storage value.
     */
    async getLogicStorage(logic, participantOrStorage, storageId, option) {
        let params;
        switch (true) {
            case (0, js_moi_utils_1.isHex)(participantOrStorage) || participantOrStorage instanceof js_moi_utils_1.StorageKey: {
                // getting value from persistent storage
                params = [{ logic_id: new js_moi_identifiers_1.LogicId(logic), storage_id: participantOrStorage instanceof js_moi_utils_1.StorageKey ? participantOrStorage.hex() : participantOrStorage, ...option }];
                break;
            }
            case (0, js_moi_identifiers_1.isIdentifier)(participantOrStorage): {
                // getting value from ephemeral storage
                if (storageId == null) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Storage key is required", "storageId", storageId);
                }
                if (!(storageId instanceof js_moi_utils_1.StorageKey) && !(0, js_moi_utils_1.isHex)(storageId)) {
                    js_moi_utils_1.ErrorUtils.throwArgumentError("Storage key must be a valid hex string or StorageKey instance", "storageId", storageId);
                }
                const storageIdHex = storageId instanceof js_moi_utils_1.StorageKey ? storageId.hex() : storageId;
                params = [{ logic_id: new js_moi_identifiers_1.LogicId(logic), id: participantOrStorage, storage_id: storageIdHex, ...option }];
                break;
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid arguments passed to get correct method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
        }
        return await this.call("moi.LogicStorage", ...params);
    }
    /**
     * Retrieves an asset from the MOI network.
     *
     * @param asset - The identifier of the asset to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the asset information.
     */
    async getAsset(asset, option) {
        return await this.call("moi.Asset", { id: new js_moi_identifiers_1.AssetId(asset), ...option });
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
    /**
     * Retrieves logic messages from the MOI network.
     *
     * @param logic - The identifier of the logic to retrieve messages for.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the logic messages.
     */
    async getLogicMessage(logic, options) {
        return await this.call("moi.LogicMessage", {
            logic_id: new js_moi_identifiers_1.LogicId(logic),
            ...options,
            topics: options?.topics ? this.encodeTopics(options.topics) : undefined,
        });
    }
    /**
     * Retrieves an account asset from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve the asset for.
     * @param asset - The identifier of the asset to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account asset information.
     */
    async getAccountAsset(participant, asset, option) {
        return await this.call("moi.AccountAsset", { id: new js_moi_identifiers_1.Identifier(participant), asset_id: new js_moi_identifiers_1.AssetId(asset), ...option });
    }
    /**
     * Retrieves an account key information from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve the key for.
     * @param index - The index of the key to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account key information.
     */
    async getAccountKey(participant, index, option) {
        if (Number.isNaN(index) || index < 0) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Must be a non-negative integer", "index", index);
        }
        return await this.call("moi.AccountKey", {
            id: new js_moi_identifiers_1.Identifier(participant),
            key_id: index,
            ...option,
        });
    }
    /**
     * Executes an interaction on the MOI network.
     *
     * @param ix - The interaction to execute.
     * @param signatures - The signatures to include in the request.
     *
     * @returns A promise that resolves to the result of the InteractionResponse.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const ix = await provider.execute({
     *     interaction: "0xf12...123",
     *     signatures: [
     *         {
     *             id: "0x123..123",
     *             key_id: 0,
     *             signature: "0x4ac..f1a",
     *         },
     *     ],
     * });
     *
     * console.log(ix.hash); // 0x123...123;
     *
     * // Wait for the confirmation of the interaction
     * const confirmation = await ix.wait();
     * // This will wait for the confirmation of the interaction and return the result
     * // of the interaction
     * const result = await ix.result();
     */
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
    /**
     * Retrieves an interaction from the MOI network.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the interaction information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const interaction = await provider.getInteraction("0x..123", {
     *     modifier: { include: ["confirmation"] },
     * });
     *
     * console.log(interaction.confirmation);
     */
    async getInteraction(hash, option) {
        return await this.call("moi.Interaction", { hash, ...option });
    }
    /**
     * Subscribes to an event on the MOI network.
     *
     * @param event - The event to subscribe to.
     * @param params - Additional parameters to include in the request.
     *
     * @returns A promise that resolves when the subscription is complete.
     */
    async subscribe(event, params) {
        return await this.call("moi.Subscribe", event, params);
    }
    /**
     * Unsubscribes from a subscription.
     * @param subscription id of the subscription to unsubscribe from.
     * @returns a promise that resolves when the un-subscription is successful.
     */
    async unsubscribe(subscription) {
        return await this.call("moi.Unsubscribe", subscription);
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