"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const events_1 = require("events");
class Provider extends events_1.EventEmitter {
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
                this.ensureValidInteraction(ix);
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
        return await this.call("moi.Simulate", { interaction: encodedIxArgs, ...option });
    }
    async getTesseractByReference(reference) {
        return await this.call("moi.Tesseract", { reference });
    }
    async getTesseractByHash(hash) {
        return await this.getTesseractByReference({ absolute: hash });
    }
    async getTesseractByAddressAndHeight(address, height) {
        if (height < -1) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid height value", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return await this.getTesseractByReference({ relative: { identifier: address, height } });
    }
    async getTesseract(hashOrAddress, heightOrInclude, include) {
        if (typeof hashOrAddress === "object" && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByAddressAndHeight(hashOrAddress.identifier, hashOrAddress.height);
        }
        if ((0, js_moi_utils_1.isAddress)(hashOrAddress) && typeof heightOrInclude === "number") {
            return await this.getTesseractByAddressAndHeight(hashOrAddress, heightOrInclude);
        }
        if ((0, js_moi_utils_1.isHex)(hashOrAddress) && (heightOrInclude == null || Array.isArray(heightOrInclude))) {
            return await this.getTesseractByHash(hashOrAddress);
        }
        js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    /**
     * Retrieves an interaction by its hash.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @returns A promise that resolves to the interaction.
     */
    async getInteraction(hash, options) {
        return await this.call("moi.Interaction", { hash, ...options });
    }
    /**
     * Retrieves information about an account.
     *
     * @param address The address that uniquely identifies the account
     * @param option The options to include and reference
     * @returns A promise that resolves to the account information
     */
    async getAccount(address, option) {
        return await this.call("moi.Account", { identifier: address, ...option });
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
        return await this.call("moi.AccountKey", {
            identifier: address,
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
        return await this.call("moi.AccountAsset", {
            identifier: address,
            asset_id: assetId,
            ...option,
        });
    }
    /**
     * Retrieves the interaction confirmation
     *
     * @param hash The hash of the interaction to retrieve the confirmation.
     * @returns A promise that resolves to object containing the confirmation information.
     */
    async getConfirmation(hash) {
        return await this.call("moi.Confirmation", { hash });
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
        return await this.call("moi.Asset", { asset_id: assetId, ...option });
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
        return await this.call("moi.Logic", { logic_id: logicId, ...option });
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
                    identifier: addressOrOption,
                    ...option,
                },
            ];
        }
        if (params == null) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return await this.call("moi.LogicStorage", ...params);
    }
    static isSignedInteraction(ix) {
        if (typeof ix !== "object" || ix == null) {
            return false;
        }
        if (!("interaction" in ix) || typeof ix.interaction !== "string") {
            return false;
        }
        if (!("signatures" in ix) || !Array.isArray(ix.signatures)) {
            return false;
        }
        return true;
    }
    ensureValidInteraction(interaction) {
        if (interaction.sender == null) {
            js_moi_utils_1.ErrorUtils.throwError("Sender is required in the interaction", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                field: "sender",
            });
        }
        if (interaction.fuel_price == null) {
            js_moi_utils_1.ErrorUtils.throwError("Fuel price is required in the interaction", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
            });
        }
        if (interaction.fuel_limit == null) {
            js_moi_utils_1.ErrorUtils.throwError("Fuel limit is required in the interaction", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
            });
        }
        if (interaction.fuel_price < 0) {
            js_moi_utils_1.ErrorUtils.throwError("Fuel price must be a unsigned number", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_price",
                value: interaction.fuel_price,
            });
        }
        if (interaction.fuel_limit < 0) {
            js_moi_utils_1.ErrorUtils.throwError("Fuel limit must be a unsigned number", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                field: "fuel_limit",
                value: interaction.fuel_limit,
            });
        }
        if (interaction.operations == null || interaction.operations.length === 0) {
            js_moi_utils_1.ErrorUtils.throwError("At least one operation is required in the interaction", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    }
    /**
     * Submits a signed interaction to the MOI protocol network.
     *
     * @param interaction - The signed interaction to submit.
     * @returns A promise that resolves to the hash of the submitted interaction.
     */
    async submit(interaction) {
        let ix;
        if (Provider.isSignedInteraction(interaction)) {
            ix = interaction;
        }
        if (ix == null) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid argument for method signature", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        if (!(0, js_moi_utils_1.isHex)(ix.interaction)) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Must be a valid hex string", "interaction", ix.interaction);
        }
        if (ix.signatures.length === 0) {
            js_moi_utils_1.ErrorUtils.throwError("Interaction must be have at least one signature", js_moi_utils_1.ErrorCode.INVALID_SIGNATURE);
        }
        return await this.call("moi.Submit", {
            interaction: ix.interaction,
            signatures: ix.signatures,
        });
    }
    async subscribe(event, ...params) {
        return await this.call("moi.Subscribe", [event, ...params]);
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
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map