import { HDKey } from "@scure/bip32";
import { ErrorCode, ErrorUtils } from "js-moi-utils";

/**
 * This class represents a Hierarchical Deterministic (HD) Node used in
 * cryptographic key generation and derivation.
 */
export class HDNode {
    private node: HDKey;

    constructor(node: HDKey) {
        this.node = node;
    }

    /**
     * Generates an HDNode from a seed.
     *
     * @param {Uint8Array} seed - The seed value.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    public static fromSeed(seed: Uint8Array): HDNode {
        try {
            // Generate the master HDNode from the seed
            const node = HDKey.fromMasterSeed(seed, undefined);
            // Derive the child HDNode using the specified path or default path
            return new HDNode(node);
        } catch (err) {
            ErrorUtils.throwError("Failed to generate HDNode from seed", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }

    /**
     * Generates an HDNode from an extended key.
     *
     * @param {string} extendedKey - The extended key.
     * @throws {Error} If an error occurs during the HDNode generation.
     */
    public static fromExtendedKey(extendedKey: string): HDNode {
        try {
            const node = HDKey.fromExtendedKey(extendedKey, undefined);
            return new HDNode(node);
        } catch (err) {
            ErrorUtils.throwError("Failed to generate HDNode from extended key", ErrorCode.UNKNOWN_ERROR, { originalError: err });
        }
    }

    /**
     * Derives a child HDNode from the current HDNode using the specified path.
     *
     * @param {string} path - The derivation path for the child HDNode.
     * @returns {HDNode} The derived child HDNode.
     * @throws {Error} If the HDNode is not initialized.
     */
    public derivePath(path: string): HDNode {
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
     */
    public deriveChild(index: number): HDNode {
        if (!this.node) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }

        const childNode = this.node.deriveChild(index);
        return new HDNode(childNode);
    }

    /**
     * Returns the extended private key associated with this HDNode.
     * @returns The string representation of the extended private key.
     */
    getExtendedPrivateKey(): string {
        return this.node.privateExtendedKey;
    }

    /**
     * Returns the extended public key for the HDNode.
     * @returns The string representation of the extended public key.
     */
    getExtendedPublicKey(): string {
        return this.node.publicExtendedKey;
    }

    /**
     * Retrieves the public key associated with the HDNode.
     *
     * @returns {Uint8Array} The public key.
     * @throws {Error} If the HDNode is not initialized.
     */
    public publicKey(): Uint8Array {
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
     */
    public privateKey(): Uint8Array {
        if (!this.node) {
            ErrorUtils.throwError("HDNode not initialized", ErrorCode.NOT_INITIALIZED);
        }

        if (!this.node.privateKey) {
            ErrorUtils.throwError("Private key not available in the HDNode", ErrorCode.PROPERTY_NOT_DEFINED);
        }
        return this.node.privateKey;
    }
}
