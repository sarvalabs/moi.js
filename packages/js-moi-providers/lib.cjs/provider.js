"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const events_1 = __importDefault(require("events"));
class Provider extends events_1.default {
    _transport;
    constructor(transport) {
        super();
        if (transport == null) {
            js_moi_utils_1.ErrorUtils.throwError("Transport is required", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        this._transport = transport;
    }
    get transport() {
        return this._transport;
    }
    async execute(method, ...params) {
        const response = await this._transport.request(method, params);
        return this.processJsonRpcResponse(response);
    }
    async request(method, params = []) {
        return await this._transport.request(method, params);
    }
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    async getVersion() {
        return await this.execute("moi.Version");
    }
    async getTesseractByReference(reference, include = []) {
        return await this.execute("moi.Tesseract", { reference, include });
    }
    async getTesseractByHash(hash, include) {
        return await this.getTesseractByReference({ absolute: hash }, include);
    }
    async getTesseractByAddressAndHeight(address, height, include) {
        if (height < -1) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid height value", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return await this.getTesseractByReference({ relative: { address, height } }, include);
    }
    async getTesseract(hashOrAddress, heightOrInclude, include) {
        if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByAddressAndHeight(hashOrAddress.address, hashOrAddress.height, heightOrInclude);
        }
        if ((0, js_moi_utils_1.isAddress)(hashOrAddress) && typeof heightOrInclude === "number") {
            return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude, include);
        }
        if ((0, js_moi_utils_1.isHex)(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByHash(hashOrAddress, heightOrInclude);
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    async getInteraction(hash) {
        return await this.execute("moi.Interaction", { hash });
    }
    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    async getAccount(address, option) {
        return await this.execute("moi.Account", { address, ...option });
    }
    /**
     * Retrieves the account key for an account.
     *
     * @param address The address that uniquely identifies the account
     * @param keyId The key id that uniquely identifies the account key
     * @param pending Whether to include pending account keys
     *
     * @returns A promise that resolves to the account information for the provided key id
     */
    async getAccountKey(address, keyId, pending) {
        return await this.execute("moi.AccountKey", {
            address,
            key_id: keyId,
            pending,
        });
    }
    /**
     * Retrieves the balances, mandates and deposits for a specific asset on an account
     *
     * @param address The address that uniquely identifies the account
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the account asset information
     */
    async getAccountAsset(address, assetId, option) {
        return await this.execute("moi.AccountAsset", {
            address,
            asset_id: assetId,
            ...option,
        });
    }
    /**
     * Retrieves information about an asset
     *
     * @param assetId The asset id that uniquely identifies the asset
     * @param option The options to include and reference
     *
     * @returns A promise that resolves to the asset information
     */
    async getAsset(assetId, option) {
        return await this.execute("moi.Asset", { asset_id: assetId, ...option });
    }
    /**
     * Retrieves information about a logic
     *
     * @param logicId A unique identifier for the logic
     * @param option The options for the tesseract reference
     *
     * @returns A promise that resolves to the logic information
     */
    async getLogic(logicId, option) {
        return await this.execute("moi.Logic", { logic_id: logicId, ...option });
    }
    async getLogicStorage(logicId, key, addressOrOption, option) {
        let params;
        if (addressOrOption == null || typeof addressOrOption === "object") {
            params = [{ logic_id: logicId, storage_key: key, ...addressOrOption }];
        }
        if ((0, js_moi_utils_1.isAddress)(addressOrOption)) {
            params = [
                {
                    logic_id: logicId,
                    storage_key: key,
                    address: addressOrOption,
                    ...option,
                },
            ];
        }
        if (params == null) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return await this.execute("moi.LogicStorage", ...params);
    }
    async subscribe(event, ...params) {
        params.unshift(event);
        return await this.execute("moi.Subscribe", [event, ...params]);
    }
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
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
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map