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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const SigningKeyErrors = __importStar(require("./errors"));
const keystore_1 = require("./keystore");
var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (exports.CURVE = CURVE = {}));
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
 * The Wallet implements the Signer API and can be used anywhere a [Signer](https://js-moi-sdk.docs.moi.technology/signer)
 * is expected and has all the required properties.
 *
 * @example
 * // creating a wallet from mnemonic
 * const wallet = await Wallet.fromMnemonic("hollow appear story text start mask salt social child ...");
 *
 * @example
 * // creating a wallet from keystore
 * const keystore = { ... }
 * const wallet = Wallet.fromKeystore(keystore, "password");
 *
 * @example
 * // Connecting a wallet to a provider
 * const wallet = await Wallet.fromMnemonic("hollow appear story text start mask salt social child ...");
 * const provider = new VoyagerProvider("babylon");
 *
 * wallet.connect(provider);
 *
 * @docs https://js-moi-sdk.docs.moi.technology/hierarchical-deterministic-wallet
 */
class Wallet extends js_moi_signer_1.Signer {
    key_index = 0;
    constructor(pKey, curve, provider) {
        try {
            if (!pKey || !(pKey instanceof Uint8Array || typeof pKey === "string")) {
                js_moi_utils_1.ErrorUtils.throwError("Key must be a Uint8Array or a string", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            if (!Object.values(CURVE).includes(curve)) {
                js_moi_utils_1.ErrorUtils.throwError(`Unsupported curve: ${curve}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
            super(provider);
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
                _public: keyPair.getPublic(true, "hex"),
                _curve: curve,
            });
        }
        catch (error) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to load wallet", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: error });
        }
    }
    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Keystore} The generated keystore object.
     * @throws {Error} if the wallet is not initialized or loaded, or if there
     * is an error generating the keystore.
     */
    generateKeystore(password) {
        try {
            const data = (0, js_moi_utils_1.hexToBytes)(this.privateKey);
            return (0, keystore_1.encryptKeystoreData)(data, password);
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to generate keystore", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Private key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get privateKey() {
        return privateMapGet(this, __vault)._key;
    }
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get mnemonic() {
        return privateMapGet(this, __vault)._mnemonic;
    }
    /**
     * Public key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    get publicKey() {
        return privateMapGet(this, __vault)._public;
    }
    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    get curve() {
        return privateMapGet(this, __vault)._curve;
    }
    /**
     * Retrieves the address associated with the wallet.
     *
     * @returns {string} The address as a string.
     */
    async getAddress() {
        return (0, js_moi_utils_1.ensureHexPrefix)(this.publicKey.slice(2));
    }
    getKeyIndex() {
        return Promise.resolve(this.key_index);
    }
    /**
     * Signs a message using the wallet's private key and the specified
     * signature algorithm.
     *
     * @param {Uint8Array} message - The message to sign as a Uint8Array.
     * @param {SigType} sigAlgo - The signature algorithm to use.
     * @returns {string} The signature as a string.
     * @throws {Error} if the signature type is unsupported or undefined, or if
     * there is an error during signing.
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
                const _sigAlgo = this.signingAlgorithms.ecdsa_secp256k1;
                const sig = _sigAlgo.sign(message, this.privateKey);
                const sigBytes = sig.serialize();
                return (0, js_moi_utils_1.bytesToHex)(sigBytes);
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Unsupported signature type", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
            }
        }
    }
    async signInteraction(ix, sig) {
        try {
            if (ix.sender.address !== (await this.getAddress())) {
                js_moi_utils_1.ErrorUtils.throwError("Sender address does not match signer address", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            const encoded = (0, js_moi_utils_1.interaction)(ix);
            const signatures = {
                identifier: ix.sender.address,
                key_idx: ix.sender.key_id,
                signature: await this.sign(encoded, sig),
            };
            return { interaction: (0, js_moi_utils_1.bytesToHex)(encoded), signatures: [signatures] };
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to sign interaction", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    static async fromMnemonic(mnemonic, options) {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, options?.words), options?.words);
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(options?.path ?? js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(Uint8Array.from(childNode.privateKey()), CURVE.SECP256K1, options?.provider);
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
    static fromMnemonicSync(mnemonic, option) {
        try {
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, option?.words), option?.words);
            const seed = bip39.mnemonicToSeedSync(mnemonic, undefined);
            const masterNode = js_moi_hdnode_1.HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(option?.path ?? js_moi_constants_1.MOI_DERIVATION_PATH);
            const wallet = new Wallet(Uint8Array.from(childNode.privateKey()), CURVE.SECP256K1, option?.provider);
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
     * Initializes the wallet from a provided keystore.
     *
     * @param {string} keystore - The keystore to initialize the wallet with.
     * @param {string} password - The password used to decrypt the keystore.
     *
     * @returns {Wallet} a instance of `Wallet`.
     * @throws {Error} if there is an error during initialization.
     */
    static fromKeystore(keystore, password, provider) {
        try {
            const privateKey = (0, keystore_1.decryptKeystoreData)(JSON.parse(keystore), password);
            return new Wallet(Uint8Array.from(privateKey), CURVE.SECP256K1);
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
    static async createRandom(provider) {
        try {
            var mnemonic = bip39.entropyToMnemonic((0, js_moi_utils_1.randomBytes)(16));
            return await Wallet.fromMnemonic(mnemonic, { provider });
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
    static createRandomSync(provider) {
        try {
            const mnemonic = bip39.entropyToMnemonic((0, js_moi_utils_1.randomBytes)(16));
            return Wallet.fromMnemonicSync(mnemonic, { provider });
        }
        catch (err) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to create random mnemonic", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=wallet.js.map