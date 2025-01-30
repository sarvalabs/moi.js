"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
/**
 * The `Signer` class is an abstract class that provides the base functionality for
 * signing and verifying messages and interactions. It also provides the ability to
 * create and execute interactions.
 *
 * Inheriting classes must implement the abstract methods `getKeyId`, `getIdentifier`,
 * `sign`, and `signInteraction`.
 */
class Signer {
    provider;
    /**
     * The signing algorithms that the signer supports.
     * By default, the signer supports the `ecdsa_secp256k1` algorithm.
     */
    signingAlgorithms;
    static DEFAULT_FUEL_PRICE = 1;
    constructor(provider, signingAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ecdsa_1.default(),
        };
    }
    /**
     * Connects the signer to a provider.
     *
     * @param {Provider} provider - The provider to connect to.
     */
    connect(provider) {
        this.provider = provider;
    }
    /**
     * Returns the provider that the signer is connected to.
     *
     * @returns {Provider} The provider that the signer is connected to.
     *
     * @throws {Error} if the provider is not initialized.
     */
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
            return { address: participant.toHex(), key_id: index, sequence_id: sequenceId };
        }
        return {
            address: (await this.getIdentifier()).toHex(),
            key_id: sender.key_id ?? (await this.getKeyId()),
            sequence_id: sender.sequence_id ?? (await this.getLatestSequence()),
        };
    }
    async createSimulateIxRequest(arg) {
        // request was array of operations
        if (Array.isArray(arg)) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: Signer.DEFAULT_FUEL_PRICE,
                operations: arg,
            };
        }
        // request was single operation
        if (typeof arg === "object" && "type" in arg && "payload" in arg) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: Signer.DEFAULT_FUEL_PRICE,
                operations: [arg],
            };
        }
        // request was simulate interaction request without `sender` and `fuel_price`
        return {
            ...arg,
            sender: await this.createIxRequestSender(arg.sender),
            fuel_price: arg.fuel_price ?? Signer.DEFAULT_FUEL_PRICE,
        };
    }
    /**
     * Creates an interaction request for either `moi.Simulate` or `moi.Execute`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest | SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<SimulateInteractionRequest | InteractionRequest>} A promise that resolves to the created interaction request.
     */
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
            fuel_limit: simulation.effort,
        };
        const err = (0, js_moi_utils_1.validateIxRequest)("moi.Execute", executeIxRequest);
        if (err != null) {
            js_moi_utils_1.ErrorUtils.throwError(`Invalid interaction request: ${err.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, { ...err });
        }
        return executeIxRequest;
    }
    /**
     * It a polymorphic function that can simulate an operation, multiple operations, or an interaction request.
     *
     * @param {AnyIxOperation | AnyIxOperation[] | SignerIx<SimulateInteractionRequest>} arg - The operation, multiple operations, or interaction request to simulate.
     * @param {SimulateOption} option - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType, Wallet } from "js-moi-sdk";
     *
     * const host = "https://voyage-rpc.moi.technology/babylon/";
     * const provider = new HttpProvider(host);
     * const wallet = await Wallet.createRandom(provider);
     * const request = {
     *     type: OpType.AssetCreate,
     *     payload: {
     *         standard: AssetStandard.MAS0,
     *         supply: 1000000,
     *         symbol: "DUMMY",
     *     },
     * };
     *
     * const simulation = await wallet.simulate(request);
     */
    async simulate(arg, option) {
        const request = await this.createIxRequest("moi.Simulate", arg);
        return await this.getProvider().simulate(request, option);
    }
    /**
     * Executes an operation, multiple operations, or an interaction request.
     *
     * @param {AnyIxOperation | AnyIxOperation[] | SignerIx<InteractionRequest> | ExecuteIx} arg - The operation, multiple operations, interaction request, or already signed request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     *
     * @throws {Error} if the sequence number is outdated or the interaction request is invalid.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType, Wallet } from "js-moi-sdk";
     *
     * const host = "https://voyage-rpc.moi.technology/babylon/";
     * const provider = new HttpProvider(host);
     * const wallet = await Wallet.createRandom(provider);
     * const request = {
     *     type: OpType.AssetCreate,
     *     payload: {
     *         standard: AssetStandard.MAS0,
     *         supply: 1000000,
     *         symbol: "DUMMY",
     *     },
     * };
     *
     * const ix = await wallet.execute(request);
     * console.log(ix.hash);
     *
     * >> "0xfe1...19"
     */
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
        if (request.sender.sequence_id < (await this.getLatestSequence())) {
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
     * @param {string|Uint8Array} signature - The signature to verify, as a string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for verification, as a string or Buffer.
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