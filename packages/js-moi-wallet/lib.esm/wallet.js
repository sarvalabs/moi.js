import elliptic from "elliptic";
import * as bip39 from "js-moi-bip39";
import { MOI_DERIVATION_PATH } from "js-moi-constants";
import { HDNode } from "js-moi-hdnode";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, bytesToHex, hexToBytes, interaction, isHex, randomBytes, trimHexPrefix, validateIxRequest } from "js-moi-utils";
import { IdentifierVersion, createParticipantId } from "js-moi-identifiers";
import * as SigningKeyErrors from "./errors";
import { decryptKeystoreData, encryptKeystoreData } from "./keystore";
export var CURVE;
(function (CURVE) {
    CURVE["SECP256K1"] = "secp256k1";
})(CURVE || (CURVE = {}));
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
export class Wallet extends Signer {
    key_index;
    constructor(pKey, curve, options) {
        try {
            super(options?.provider);
            if (!pKey || !(pKey instanceof Uint8Array || typeof pKey === "string")) {
                ErrorUtils.throwError("Key must be a Uint8Array or a string", ErrorCode.INVALID_ARGUMENT);
            }
            if (!Object.values(CURVE).includes(curve)) {
                ErrorUtils.throwError(`Unsupported curve: ${curve}`, ErrorCode.UNSUPPORTED_OPERATION);
            }
            if (typeof pKey === "string") {
                pKey = hexToBytes(pKey);
            }
            __vault.set(this, {
                value: void 0,
            });
            const ecPrivKey = new elliptic.ec(curve);
            const keyPair = ecPrivKey.keyFromPrivate(pKey);
            privateMapSet(this, __vault, {
                _key: keyPair.getPrivate("hex"),
                _public: trimHexPrefix(bytesToHex(Uint8Array.from(keyPair.getPublic().encodeCompressed("array").slice(1)))),
                _curve: curve,
            });
            this.key_index = options?.keyId ?? DEFAULT_KEY_ID;
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet", ErrorCode.UNKNOWN_ERROR, { originalError: error });
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
    async generateKeystore(password) {
        try {
            const data = hexToBytes(await this.getPrivateKey());
            return encryptKeystoreData(data, password);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to generate keystore", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Private key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    getPrivateKey() {
        return Promise.resolve(privateMapGet(this, __vault)._key);
    }
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    getMnemonic() {
        return Promise.resolve(privateMapGet(this, __vault)._mnemonic);
    }
    getPublicKey() {
        return Promise.resolve(privateMapGet(this, __vault)._public);
    }
    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    getCurve() {
        return privateMapGet(this, __vault)._curve;
    }
    async getIdentifier() {
        const publickey = await this.getPublicKey();
        const fingerprint = hexToBytes(publickey).slice(0, 24);
        return createParticipantId({ fingerprint, variant: 0, version: IdentifierVersion.V0 });
    }
    getKeyId() {
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
        if (!message || !(isHex(message) || message instanceof Uint8Array)) {
            ErrorUtils.throwError("Message must be a hex string or Uint8Array", ErrorCode.INVALID_ARGUMENT);
        }
        if (sig == null) {
            ErrorUtils.throwError("Signature type cannot be undefined", ErrorCode.INVALID_ARGUMENT);
        }
        if (typeof message === "string") {
            message = hexToBytes(message);
        }
        switch (sig.sigName) {
            case "ECDSA_S256": {
                const algorithm = this.signingAlgorithms.ecdsa_secp256k1;
                const sig = algorithm.sign(message, await this.getPrivateKey());
                return bytesToHex(sig.serialize());
            }
            default: {
                ErrorUtils.throwError("Unsupported signature type", ErrorCode.UNSUPPORTED_OPERATION);
            }
        }
    }
    async signInteraction(ix, sig) {
        try {
            const error = validateIxRequest("moi.Execute", ix);
            if (error) {
                ErrorUtils.throwArgumentError(`Invalid interaction request: ${error.message}`, ErrorCode.INVALID_ARGUMENT, error);
            }
            const identifier = await this.getIdentifier();
            if (ix.sender.id !== identifier.toHex()) {
                ErrorUtils.throwError("Sender identifier does not match signer identifier", ErrorCode.INVALID_ARGUMENT);
            }
            const encoded = interaction(ix);
            const signatures = {
                id: ix.sender.id,
                key_id: ix.sender.key_id,
                signature: await this.sign(encoded, sig),
            };
            return { interaction: bytesToHex(encoded), signatures: [signatures] };
        }
        catch (err) {
            ErrorUtils.throwError("Failed to sign interaction", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    static async fromMnemonic(mnemonic, optionOrPath, options) {
        try {
            const option = typeof optionOrPath === "object" ? optionOrPath : options;
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, option?.words), option?.words);
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(typeof optionOrPath === "string" ? optionOrPath : MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1, { ...option });
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet from mnemonic", ErrorCode.UNKNOWN_ERROR, {
                originalError: error,
            });
        }
    }
    static fromMnemonicSync(mnemonic, optionOrPath, options) {
        try {
            const option = typeof optionOrPath === "object" ? optionOrPath : options;
            mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, option?.words), option?.words);
            const seed = bip39.mnemonicToSeedSync(mnemonic, undefined);
            const masterNode = HDNode.fromSeed(seed);
            const childNode = masterNode.derivePath(typeof optionOrPath === "string" ? optionOrPath : MOI_DERIVATION_PATH);
            const wallet = new Wallet(childNode.privateKey(), CURVE.SECP256K1, { ...option });
            privateMapSet(wallet, __vault, {
                ...privateMapGet(wallet, __vault),
                _mnemonic: mnemonic,
            });
            return wallet;
        }
        catch (error) {
            ErrorUtils.throwError("Failed to load wallet from mnemonic", ErrorCode.UNKNOWN_ERROR, {
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
    static fromKeystore(keystore, password, option) {
        try {
            const privateKey = decryptKeystoreData(JSON.parse(keystore), password);
            return new Wallet(Uint8Array.from(privateKey), CURVE.SECP256K1, option);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to load wallet from keystore", ErrorCode.UNKNOWN_ERROR, {
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
            var mnemonic = bip39.entropyToMnemonic(randomBytes(16));
            return await Wallet.fromMnemonic(mnemonic, option);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
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
            const mnemonic = bip39.entropyToMnemonic(randomBytes(16));
            return Wallet.fromMnemonicSync(mnemonic, option);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to create random mnemonic", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
}
//# sourceMappingURL=wallet.js.map