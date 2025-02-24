"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = exports.CURVE = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const bip39 = __importStar(require("js-moi-bip39"));
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_hdnode_1 = require("js-moi-hdnode");
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const SigningKeyErrors = __importStar(require("./errors"));
const keystore_1 = require("./keystore");
var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (exports.CURVE = CURVE = {}));
const DEFAULT_KEY_ID = 0;
/**
 * Retrieves the value associated with the receiver from a private map.
 * Throws an error if the receiver is not found in the map.
 *
 * @param receiver - The receiver object.
 * @param privateMap - The private map containing the receiver and its associated value.
 * @returns The value associated with the receiver.
 * @throws Error if the receiver is not found in the private map.
 */
const privateMapGet = (receiver, privateMap) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet();
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
};
/**
 * Sets the value associated with the receiver in a private map.
 * Throws an error if the receiver is not found in the map.
 *
 * @param receiver - The receiver object.
 * @param privateMap - The private map containing the receiver and its associated value.
 * @param value - The value to set.
 * @returns The updated value.
 * @throws Error if the receiver is not found in the private map.
 */
const privateMapSet = (receiver, privateMap, value) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet();
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    }
    else {
        descriptor.value = value;
    }
    return value;
};
const __vault = new WeakMap();
/**
 * A class representing a wallet that can sign interactions.
 *
 * The Wallet implements the Signer API and can be used anywhere a
 * `Signer` is expected and has all the required properties.
 */
class Wallet extends js_moi_signer_1.Signer {
    key_index;
    constructor(pKey, curve, options) {
        try {
            super(options?.provider);
            if (!pKey || !(pKey instanceof Uint8Array || typeof pKey === "string")) {
                js_moi_utils_1.ErrorUtils.throwError("Key must be a Uint8Array or a string", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            if (!Object.values(CURVE).includes(curve)) {
                js_moi_utils_1.ErrorUtils.throwError(`Unsupported curve: ${curve}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
            if (typeof pKey === "string") {
                pKey = (0, js_moi_utils_1.hexToBytes)(pKey);
            }
            __vault.set(this, {
                value: void 0,
            });
            const ecPrivKey = new elliptic_1.default.ec(curve);
            const keyPair = ecPrivKey.keyFromPrivate(pKey);
            privateMapSet(this, __vault, {
                _key: keyPair.getPrivate("hex"),
                _public: (0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(Uint8Array.from(keyPair.getPublic().encodeCompressed("array").slice(1)))),
                _curve: curve,
            });
            this.key_index = options?.keyId ?? DEFAULT_KEY_ID;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }
    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Promise<Keystore>} A promise that resolves to the keystore.
     */
    async generateKeystore(password) {
        try {
            const data = (0, js_moi_utils_1.hexToBytes)(await this.getPrivateKey());
            return (0, keystore_1.encryptKeystoreData)(data, password);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to generate keystore", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Retrieves the private key associated with the wallet.
     *
     * @returns {Promise<string>} A promise that resolves to the private key
     */
    getPrivateKey() {
        return Promise.resolve(privateMapGet(this, __vault)._key);
    }
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns {Promise<string | undefined>} A promise that resolves to the mnemonic
     */
    getMnemonic() {
        return Promise.resolve(privateMapGet(this, __vault)._mnemonic);
    }
    /**
     * Retrieves the public key associated with the wallet.
     *
     * @returns {Promise<string>} A promise that resolves to the public key
     */
    getPublicKey() {
        return Promise.resolve(privateMapGet(this, __vault)._public);
    }
    /**
     * Retrieves the curve associated with the wallet.
     *
     * @returns {Promise<CURVE>} A promise that resolves to the curve
     */
    getCurve() {
        return privateMapGet(this, __vault)._curve;
    }
    /**
     * Retrieves the identifier for the wallet.
     *
     * @returns {Promise<Identifier>} A promise that resolves to the wallet's identifier.
     */
    async getIdentifier() {
        const publickey = await this.getPublicKey();
        const fingerprint = (0, js_moi_utils_1.hexToBytes)(publickey).slice(0, 24);
        return (0, js_moi_identifiers_1.createParticipantId)({ fingerprint, variant: 0, version: js_moi_identifiers_1.IdentifierVersion.V0 });
    }
    /**
     * Retrieves the key identifier.
     *
     * @returns {Promise<number>} A promise that resolves to the key index.
     */
    getKeyId() {
        return Promise.resolve(this.key_index);
    }
    /**
     * Signs a message using the wallet's private key and the specified
     * signature algorithm.
     *
     * @param {Uint8Array} message - The message to sign as a Uint8Array.
     * @param {SigType} sig - The signature algorithm to use.
     * @returns {string} A promise that resolves to the signature as a hex string.
     * @throws {Error} if the signature type is unsupported or undefined, or if there is an error during signing.
     *
     * @example
     * import { encodeText, Wallet } from "js-moi-sdk";
     *
     * const wallet = await Wallet.createRandom();
     * const message = "Hello, World!";
     * const algorithm = wallet.signingAlgorithms.ecdsa_secp256k1;
     *
     * const signature = await wallet.sign(encodeText(message), algorithm);
     *
     * console.log(signature);
     *
     * >> "0x014730450221009cb0e...bafc8b989602"
     */
    async sign(message, sig) {
        if (!message || !((0, js_moi_utils_1.isHex)(message) || message instanceof Uint8Array)) {
            js_moi_utils_1.ErrorUtils.throwError("Message must be a hex string or Uint8Array", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        if (sig == null) {
            js_moi_utils_1.ErrorUtils.throwError("Signature type cannot be undefined", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        if (typeof message === "string") {
            message = (0, js_moi_utils_1.hexToBytes)(message);
        }
        switch (sig.sigName) {
            case "ECDSA_S256": {
                const algorithm = this.signingAlgorithms.ecdsa_secp256k1;
                const sig = algorithm.sign(message, await this.getPrivateKey());
                return (0, js_moi_utils_1.bytesToHex)(sig.serialize());
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Unsupported signature type", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
        }
    }
    /**
     * Signs an interaction request.
     *
     * @param {InteractionRequest} ix - The interaction request to be signed.
     * @param {SigType} sig - The signature type to be used for signing.
     * @returns {Promise<ExecuteIx>} A promise that resolves to an object containing the encoded interaction and its signatures.
     * @throws {Error} Throws an error if the interaction request is invalid, the sender identifier does not match the signer identifier, or if signing the interaction fails.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType, Wallet } from "js-moi-sdk";
     *
     * const host = "https://voyage-rpc.moi.technology/babylon/";
     * const provider = new HttpProvider(host);
     * const wallet = await Wallet.createRandom();
     * const identifier = await wallet.getIdentifier();
     * const algorithm = wallet.signingAlgorithms.ecdsa_secp256k1;
     * const request = {
     *     sender: {
     *         address: identifier.toHex(),
     *         key_id: 0,
     *         sequence_id: 0,
     *     },
     *     fuel_price: 1,
     *     fuel_limit: 100,
     *     operations: [
     *         {
     *             type: OpType.AssetCreate,
     *             payload: {
     *                 standard: AssetStandard.MAS0,
     *                 supply: 1000000,
     *                 symbol: "DUMMY",
     *             },
     *         },
     *     ],
     * };
     *
     * wallet.connect(provider);
     * const signedRequest = await wallet.signInteraction(request, algorithm);
     */
    async signInteraction(ix, sig) {
        try {
            const error = (0, js_moi_utils_1.validateIxRequest)("moi.Execute", ix);
            if (error) {
                js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid interaction request: ${error.message}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, error);
            }
            const identifier = await this.getIdentifier();
            if (ix.sender.id !== identifier.toHex()) {
                js_moi_utils_1.ErrorUtils.throwError("Sender identifier does not match signer identifier", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            const encoded = (0, js_moi_utils_1.interaction)(ix);
            const signatures = {
                id: ix.sender.id,
                key_id: ix.sender.key_id,
                signature: await this.sign(encoded, sig),
            };
            return { interaction: (0, js_moi_utils_1.bytesToHex)(encoded), signatures: [signatures] };
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to sign interaction", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Create a wallet from mnemonic
     *
     * It is a polymorphic function that accepts mnemonic as first argument,
     * if path is provided as second argument, it will use the path to derive the wallet.
     *
     * @returns {Promise<Wallet>} A promise that resolves to a `Wallet` instance.
     *
     * @throws {Error} if there is an error during initialization.
     */
    static async fromMnemonic(mnemonic, optionOrPath, options) {
        try {
            const option = typeof optionOrPath === "object" ? optionOrPath : options;
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, option?.words), option?.words);
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(typeof optionOrPath === "string" ? optionOrPath : js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1, { ...option });
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, {
                originalError: error,
            });
        }
    }
    /**
     * Create a wallet from mnemonic synchronously.
     *
     * It is a polymorphic function that accepts mnemonic as first argument,
     * if path is provided as second argument, it will use the path to derive the wallet.
     *
     * @returns {Wallet} a instance of `Wallet`.
     */
    static fromMnemonicSync(mnemonic, optionOrPath, options) {
        try {
            const option = typeof optionOrPath === "object" ? optionOrPath : options;
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, option?.words), option?.words);
            const seed = bip39.mnemonicToSeedSync(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(typeof optionOrPath === "string" ? optionOrPath : js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1, { ...option });
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet from mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, {
                originalError: error,
            });
        }
    }
    /**
     * Creates a Wallet instance from a keystore JSON string and a password.
     *
     * @param {string} keystore - The keystore JSON string containing the encrypted private key.
     * @param {string} password - The password to decrypt the keystore.
     * @param {Provider} provider - (Optional) The provider to be used by the wallet.
     *
     * @returns A Wallet instance.
     *
     * @throws Will throw an error if the wallet cannot be loaded from the keystore.
     */
    static fromKeystore(keystore, password, option) {
        try {
            const privateKey = (0, keystore_1.decryptKeystoreData)(JSON.parse(keystore), password);
            return new Wallet(Uint8Array.from(privateKey), CURVE.SECP256K1, option);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet from keystore", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, {
                originalError: err,
            });
        }
    }
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static async createRandom(option) {
        try {
            var mnemonic = bip39.entropyToMnemonic((0, js_moi_utils_1.randomBytes)(16));
            return await Wallet.fromMnemonic(mnemonic, option);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Wallet} a instance of `Wallet`.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandomSync(option) {
        try {
            const mnemonic = bip39.entropyToMnemonic((0, js_moi_utils_1.randomBytes)(16));
            return Wallet.fromMnemonicSync(mnemonic, option);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map