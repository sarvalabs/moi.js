import { type ExecuteIx } from "js-moi-providers";
import { SigType, Signer } from "js-moi-signer";
import { type Hex, type InteractionRequest } from "js-moi-utils";
import { Identifier } from "js-moi-identifiers";
import { Keystore } from "../types/keystore";
import { FromMnemonicOptions, type WalletOption } from "../types/wallet";
export declare enum CURVE {
    SECP256K1 = "secp256k1"
}
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
export declare class Wallet extends Signer {
    private readonly key_index;
    constructor(pKey: Uint8Array | string, curve: CURVE, options?: WalletOption);
    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Keystore} The generated keystore object.
     * @throws {Error} if the wallet is not initialized or loaded, or if there
     * is an error generating the keystore.
     */
    generateKeystore(password: string): Promise<Keystore>;
    /**
     * Private key associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    getPrivateKey(): Promise<string>;
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @throws {Error} if the wallet is not loaded or initialized.
     * @readonly
     */
    getMnemonic(): Promise<string | undefined>;
    getPublicKey(): Promise<string>;
    /**
     * Curve associated with the wallet.
     *
     * @readonly
     */
    getCurve(): Promise<CURVE>;
    getIdentifier(): Promise<Identifier>;
    getKeyId(): Promise<number>;
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
    sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;
    signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;
    static fromMnemonic(mnemonic: string, path?: string, options?: FromMnemonicOptions): Promise<Wallet>;
    static fromMnemonic(mnemonic: string, options?: FromMnemonicOptions): Promise<Wallet>;
    static fromMnemonicSync(mnemonic: string, path?: string, options?: FromMnemonicOptions): Wallet;
    static fromMnemonicSync(mnemonic: string, options?: FromMnemonicOptions): Wallet;
    /**
     * Initializes the wallet from a provided keystore.
     *
     * @param {string} keystore - The keystore to initialize the wallet with.
     * @param {string} password - The password used to decrypt the keystore.
     *
     * @returns {Wallet} a instance of `Wallet`.
     * @throws {Error} if there is an error during initialization.
     */
    static fromKeystore(keystore: string, password: string, option?: WalletOption): Wallet;
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Promise<Wallet>} a promise that resolves to a `Wallet` instance.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandom(option?: WalletOption): Promise<Wallet>;
    /**
     * Generates a random mnemonic and initializes the wallet from it.
     *
     * @returns {Wallet} a instance of `Wallet`.
     *
     * @throws {Error} if there is an error generating the random mnemonic.
     */
    static createRandomSync(option?: WalletOption): Wallet;
}
//# sourceMappingURL=wallet.d.ts.map