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
 * The Wallet implements the Signer API and can be used anywhere a
 * `Signer` is expected and has all the required properties.
 */
export declare class Wallet extends Signer {
    private readonly key_index;
    constructor(pKey: Uint8Array | string, curve: CURVE, options?: WalletOption);
    /**
     * Generates a keystore file from the wallet's private key, encrypted with a password.
     *
     * @param {string} password Used for encrypting the keystore data.
     * @returns {Promise<Keystore>} A promise that resolves to the keystore.
     */
    generateKeystore(password: string): Promise<Keystore>;
    /**
     * Retrieves the private key associated with the wallet.
     *
     * @returns {Promise<string>} A promise that resolves to the private key
     */
    getPrivateKey(): Promise<string>;
    /**
     * Retrieves the mnemonic associated with the wallet.
     *
     * @returns {Promise<string | undefined>} A promise that resolves to the mnemonic
     */
    getMnemonic(): Promise<string | undefined>;
    /**
     * Retrieves the public key associated with the wallet.
     *
     * @returns {Promise<string>} A promise that resolves to the public key
     */
    getPublicKey(): Promise<string>;
    /**
     * Retrieves the curve associated with the wallet.
     *
     * @returns {Promise<CURVE>} A promise that resolves to the curve
     */
    getCurve(): Promise<CURVE>;
    /**
     * Retrieves the identifier for the wallet.
     *
     * @returns {Promise<Identifier>} A promise that resolves to the wallet's identifier.
     */
    getIdentifier(): Promise<Identifier>;
    /**
     * Retrieves the key identifier.
     *
     * @returns {Promise<number>} A promise that resolves to the key index.
     */
    getKeyId(): Promise<number>;
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
    sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;
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
    signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;
    /**
     * Create a wallet from a mnemonic.
     *
     * @param {string} mnemonic - The mnemonic to create the wallet from.
     * @param {string} path - The optional derivation path to use.
     * @param {FromMnemonicOptions | undefined} options - The optional options to use.
     *
     * @returns {Promise<Wallet>} A promise that resolves to a `Wallet` instance.
     */
    static fromMnemonic(mnemonic: string, path?: string, options?: FromMnemonicOptions): Promise<Wallet>;
    /**
     * Create a wallet from mnemonic
     *
     * @param {string} mnemonic - The mnemonic to create the wallet from.
     * @param {FromMnemonicOptions | undefined} options - The optional derivation path to use.
     *
     * @returns {Promise<Wallet>} A promise that resolves to a `Wallet` instance.
     */
    static fromMnemonic(mnemonic: string, options?: FromMnemonicOptions): Promise<Wallet>;
    /**
     * Create a wallet from mnemonic synchronously.
     *
     * @param {string} mnemonic - The mnemonic to create the wallet from.
     * @param {string | undefined} path - The optional derivation path to use.
     * @param {FromMnemonicOptions | undefined} options - The optional options to use.
     *
     * @returns {Wallet} a instance of `Wallet`.
     * @throws {Error} if there is an error during initialization.
     */
    static fromMnemonicSync(mnemonic: string, path?: string, options?: FromMnemonicOptions): Wallet;
    /**
     * Create a wallet from mnemonic synchronously.
     *
     * @param {string} mnemonic - The mnemonic to create the wallet from.
     * @param {FromMnemonicOptions | undefined} options - The optional options to use.
     *
     * @returns {Wallet} a instance of `Wallet`.
     * @throws {Error} if there is an error during initialization.
     */
    static fromMnemonicSync(mnemonic: string, options?: FromMnemonicOptions): Wallet;
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