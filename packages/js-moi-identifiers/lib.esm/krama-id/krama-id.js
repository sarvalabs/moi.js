import elliptic from "elliptic";
import { createFromB58String, createFromPubKey } from "peer-id";
import { decodeBase58, encodeBase58, hexToBytes } from "../utils";
import { KramaIdKind } from "./krama-id-enums";
import { KramaIdMetadata } from "./krama-id-metadata";
import { KramaIdTag } from "./krama-id-tag";
/**
 * KramaId is a unique identifier for a guardian node.
 */
export class KramaId {
    value;
    constructor(value) {
        this.value = value;
    }
    getPeerIdLength(tag) {
        switch (tag.getKind()) {
            case KramaIdKind.Guardian:
                return 53;
            default:
                throw new Error("Unsupported krama id kind");
        }
    }
    /**
     * Retrieves the tag associated with the Krama ID.
     *
     * @returns {KramaIdTag} The tag derived from the first byte of the decoded value.
     */
    getTag() {
        const decoded = decodeBase58(this.value.slice(0, 2));
        return new KramaIdTag(decoded[0]);
    }
    /**
     * Retrieves the metadata associated with the Krama ID.
     *
     * @returns {KramaIdMetadata} The metadata object containing information about the Krama ID.
     */
    getMetadata() {
        const decoded = decodeBase58(this.value.slice(0, 2));
        return new KramaIdMetadata(decoded[1]);
    }
    /**
     * Retrieves the peer ID by slicing the value based on the calculated peer ID length.
     *
     * @returns The peer ID extracted from the value.
     */
    getPeerId() {
        const length = this.getPeerIdLength(this.getTag());
        return this.value.slice(-length);
    }
    /**
     * Asynchronously retrieves and decodes the peer ID.
     *
     * @returns A promise that resolves to the decoded peer ID.
     */
    getDecodedPeerId() {
        return createFromB58String(this.getPeerId());
    }
    toString() {
        return this.value;
    }
    toJSON() {
        return this.value;
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return "KramaId(" + this.value + ")";
    }
    static async peerIdFromPrivateKey(privateKey) {
        if (privateKey.length !== 32) {
            throw new Error("Invalid private key length");
        }
        const compressedPubKey = new elliptic.ec("secp256k1").keyFromPrivate(privateKey).getPublic(true, "array");
        const raw = new Uint8Array([0, 37, 8, 2, 18, 33, ...compressedPubKey]);
        return await createFromPubKey(raw);
    }
    /**
     * Creates a `KramaId` instance from a given private key.
     *
     * @param zone - The network zone to which the `KramaId` belongs.
     * @param privateKey - The private key used to generate the `KramaId`. It can be a `Uint8Array` or a hexadecimal string.
     * @returns A promise that resolves to a `KramaId` instance.
     */
    static async fromPrivateKey(kind, version, zone, privateKey) {
        const pKey = typeof privateKey === "string" ? hexToBytes(privateKey) : privateKey;
        return this.fromPeerId(kind, version, zone, await KramaId.peerIdFromPrivateKey(pKey));
    }
    /**
     * Creates a new KramaId instance from the given peer ID.
     *
     * @param kind - The kind of KramaId.
     * @param version - The version number.
     * @param zone - The network zone.
     * @param peerId - The peer ID string.
     * @returns A new KramaId instance.
     */
    static fromPeerId(kind, version, zone, peerId) {
        const tag = new KramaIdTag((kind << 4) | version);
        const metadata = zone << 4;
        const encoded = encodeBase58(new Uint8Array([tag.value, metadata]));
        const peerIdString = typeof peerId === "string" ? peerId : peerId.toB58String();
        return new KramaId(encoded + peerIdString);
    }
}
//# sourceMappingURL=krama-id.js.map