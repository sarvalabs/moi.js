import { HDKey } from "@scure/bip32";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
/**
 * This class represents a Hierarchical Deterministic (HD) Node used in
 * cryptographic key generation and derivation.
 */
export class HDNode {
    node;
    constructor(node) {
        this.node = node;
    }
    /**
     * Generates an HDNode from a seed.
     *
     * @param {Uint8Array} seed - The seed value.
     * @throws {Error} If an error occurs during the HDNode generation.
     *
     * @example
     * import { HDNode, hexToBytes, mnemonicToEntropy } from "js-moi-sdk";
     *
     * const mnemonic = "hollow appear ... hurdle";
     * const seed = mnemonicToEntropy(mnemonic);
     * const hdNode = HDNode.fromSeed(hexToBytes(seed));
     *
     * console.log(hdNode);
     *
     * >> HDNode { node: HDKey { ... } }
     */
    static fromSeed(seed) {
        try {
            // Generate the master HDNode from the seed
            const node = HDKey.fromMasterSeed(seed, undefined);
            // Derive the child HDNode using the specified path or default path
            return new HDNode(node);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to generate HDNode from seed", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     *
     * @example
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromExtendedKey("...");
     * console.log(hdNode);
     *
     * >> HDNode { node: HDKey { ... } }
     */
    static fromExtendedKey(extendedKey) {
        try {
            const node = HDKey.fromExtendedKey(extendedKey, undefined);
            return new HDNode(node);
        }
        catch (err) {
            ErrorUtils.throwError("Failed to generate HDNode from extended key", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }
    /**
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     *
     * @example
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const childNode = hdNode.derivePath("m/44'/0'/0'/0/0");
     *
     * console.log(childNode);
     *
     * >> HDNode { node: HDKey { ... } }
     */
    derivePath(path) {
        if (!this.node) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.derive(path);
        return new HDNode(childNode);
    }
    /**
     * Derives a child HDNode from the current HDNode using the specified index.
     *
     * @param {number} index - The child index.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     *
     * @example
     *
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const childHdNode = hdNode.deriveChild(0);
     *
     * console.log(childHdNode);
     *
     * >> HDNode { node: HDKey { ... } }
     */
    deriveChild(index) {
        if (!this.node) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }
        const childNode = this.node.deriveChild(index);
        return new HDNode(childNode);
    }
    /**
     * Returns the extended private key associated with this HDNode.
     * @returns The string representation of the extended private key.
     *
     * @example
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const extendedPrivateKey = hdNode.getExtendedPrivateKey();
     *
     * console.log(extendedPrivateKey);
     *
     * >> "xprv9s..."
     */
    getExtendedPrivateKey() {
        return this.node.privateExtendedKey;
    }
    /**
     * Returns the extended public key for the HDNode.
     * @returns The string representation of the extended public key.
     *
     * @example
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const extendedPublicKey = hdNode.getExtendedPublicKey();
     *
     * console.log(extendedPublicKey);
     *
     * >> "xpub9s..."
     */
    getExtendedPublicKey() {
        return this.node.publicExtendedKey;
    }
    /**
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Uint8Array} The public key.
     * @throws {Error} If the HDNode is not initialized.
     *
     * @example
     *
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const publicKey = hdNode.publicKey();
     *
     * console.log(publicKey);
     *
     * >> Uint8Array(33) [4, 5, ... 35]
     */
    publicKey() {
        if (this.node.publicKey == null) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }
        return this.node.publicKey;
    }
    /**
     * Retrieves the private key associated with the HDNode.
     *
     * @returns {Uint8Array} The private key.
     * @throws {Error} If the HDNode is not initialized or private key is not available.
     *
     * @example
     * import { HDNode } from "js-moi-sdk";
     *
     * const hdNode = HDNode.fromSeed("...");
     * const privateKey = hdNode.privateKey();
     *
     * console.log(privateKey);
     *
     * >> Uint8Array(32) [4, 5, ... 35]
     */
    privateKey() {
        if (!this.node) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }
        if (!this.node.privateKey) {
            ErrorUtils.throwError("Private key not available in the HDNode", ErrorCode.PROPERTY_NOT_DEFINED);
        }
        return this.node.privateKey;
    }
}
//# sourceMappingURL=hdnode.js.map