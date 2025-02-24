"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
const DEFAULT_FUEL_PRICE = 1;
class Signer {
    provider;
    signingAlgorithms;
    fuelPrice = DEFAULT_FUEL_PRICE;
    constructor(provider, signingAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ecdsa_1.default(),
        };
    }
    /**
     * Sets the fuel price for the signer.
     *
     * @param {number} fuelPrice - The fuel price to set.
     * @returns {void}
     * @throws {Error} if the fuel price is less than 1.
     */
    setFuelPrice(fuelPrice) {
        if (fuelPrice < 1) {
            js_moi_utils_1.ErrorUtils.throwError("Fuel price must be greater than or equal to 1", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, { fuelPrice });
        }
        this.fuelPrice = fuelPrice;
    }
    connect(provider) {
        this.provider = provider;
    }
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        js_moi_utils_1.ErrorUtils.throwError("Provider is not initialized!", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    async getLatestSequence() {
        const [participant, index] = await Promise.all([this.getIdentifier(), this.getKeyId()]);
        const { sequence } = await this.getProvider().getAccountKey(participant, index);
        return sequence;
    }
    async createIxRequestSender(sender) {
        if (sender == null) {
            const [participant, index, sequenceId] = await Promise.all([this.getIdentifier(), this.getKeyId(), this.getLatestSequence()]);
            return { id: participant.toHex(), key_id: index, sequence: sequenceId };
        }
        return {
            id: (await this.getIdentifier()).toHex(),
            key_id: sender.key_id ?? (await this.getKeyId()),
            sequence: sender.sequence ?? (await this.getLatestSequence()),
        };
    }
    async createSimulateIxRequest(arg) {
        // request was array of operations
        if (Array.isArray(arg)) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: this.fuelPrice,
                operations: arg,
            };
        }
        // request was single operation
        if (typeof arg === "object" && "type" in arg && "payload" in arg) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: this.fuelPrice,
                operations: [arg],
            };
        }
        // request was simulate interaction request without `sender` and `fuel_price`
        return {
            ...arg,
            sender: await this.createIxRequestSender(arg.sender),
            fuel_price: arg.fuel_price ?? this.fuelPrice,
        };
    }
    async createIxRequest(type, args) {
        const simulateIxRequest = await this.createSimulateIxRequest(args);
        if (type === "moi.Simulate") {
            return simulateIxRequest;
        }
        if (typeof args === "object" && "fuel_limit" in args && typeof args.fuel_limit === "number") {
            return { ...simulateIxRequest, fuel_limit: args.fuel_limit };
        }
        const simulation = await this.simulate(simulateIxRequest);
        const executeIxRequest = {
            ...simulateIxRequest,
            fuel_limit: simulation.fuel_spent,
        };
        const err = (0, js_moi_utils_1.validateIxRequest)("moi.Execute", executeIxRequest);
        if (err != null) {
            js_moi_utils_1.ErrorUtils.throwError(`Invalid interaction request: ${err.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, { ...err });
        }
        return executeIxRequest;
    }
    async simulate(arg, option) {
        const request = await this.createIxRequest("moi.Simulate", arg);
        return await this.getProvider().simulate(request, option);
    }
    async execute(arg) {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        // checking argument is an already signed request
        if (typeof arg === "object" && "interaction" in arg && "signatures" in arg) {
            if (!(0, js_moi_utils_1.isHex)(arg.interaction)) {
                js_moi_utils_1.ErrorUtils.throwError("Invalid interaction provided. Not a valid hex.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                    interaction: arg.interaction,
                });
            }
            if (!Array.isArray(arg.signatures)) {
                js_moi_utils_1.ErrorUtils.throwError("Invalid signatures provided. Not an array.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                    signatures: arg.signatures,
                });
            }
            return await this.getProvider().execute(arg);
        }
        const request = await this.createIxRequest("moi.Execute", arg);
        if (request.sender.sequence < (await this.getLatestSequence())) {
            js_moi_utils_1.ErrorUtils.throwError("Sequence number is outdated", js_moi_utils_1.ErrorCode.SEQUENCE_EXPIRED);
        }
        const error = (0, js_moi_utils_1.validateIxRequest)("moi.Execute", request);
        if (error != null) {
            js_moi_utils_1.ErrorUtils.throwError(`Invalid interaction request: ${error.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, error);
        }
        const signedRequest = await this.signInteraction(request, algorithm);
        return await this.getProvider().execute(signedRequest);
    }
    /**
     * Verifies the authenticity of a signature by performing signature verification
     * using the provided parameters.
     *
     * @param {Uint8Array} message - The message that was signed.
     * @param {string|Uint8Array} signature - The signature to verify, as a
     * string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for
     * verification, as a string or Buffer.
     * @returns {boolean} A boolean indicating whether the signature is valid or not.
     * @throws {Error} if the signature is invalid or the signature byte is not recognized.
     */
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = (0, js_moi_utils_1.hexToBytes)(publicKey);
        }
        else {
            verificationKey = publicKey;
        }
        if (verificationKey.length === 33) {
            verificationKey = verificationKey.slice(1);
        }
        const sig = new signature_1.default();
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", js_moi_utils_1.ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
exports.Signer = Signer;
//# sourceMappingURL=signer.js.map