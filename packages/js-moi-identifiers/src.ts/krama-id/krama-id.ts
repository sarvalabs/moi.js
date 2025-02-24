import elliptic from "elliptic";
import PeerId, { createFromB58String, createFromPubKey } from "peer-id";

import { decodeBase58, encodeBase58, hexToBytes, type Hex } from "../utils";
import { KramaIdKind, KramaIdVersion, NetworkZone } from "./krama-id-enums";
import { KramaIdMetadata } from "./krama-id-metadata";
import { KramaIdTag } from "./krama-id-tag";

/**
 * KramaId is a unique identifier for a guardian node.
 */
export class KramaId {
    private readonly value: string;

    public constructor(value: string) {
        this.value = value;
    }

    private getPeerIdLength(tag: KramaIdTag): number {
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
    public getTag(): KramaIdTag {
        const decoded = decodeBase58(this.value.slice(0, 2));
        return new KramaIdTag(decoded[0]);
    }

    /**
     * Retrieves the metadata associated with the Krama ID.
     *
     * @returns {KramaIdMetadata} The metadata object containing information about the Krama ID.
     */
    public getMetadata(): KramaIdMetadata {
        const decoded = decodeBase58(this.value.slice(0, 2));
        return new KramaIdMetadata(decoded[1]);
    }

    /**
     * Retrieves the peer ID by slicing the value based on the calculated peer ID length.
     *
     * @returns The peer ID extracted from the value.
     */
    public getPeerId(): string {
        const length = this.getPeerIdLength(this.getTag());
        return this.value.slice(-length);
    }

    /**
     * Asynchronously retrieves and decodes the peer ID.
     *
     * @returns A promise that resolves to the decoded peer ID.
     */
    public getDecodedPeerId(): PeerId {
        return createFromB58String(this.getPeerId());
    }

    public toString() {
        return this.value;
    }

    public toJSON() {
        return this.value;
    }

    [Symbol.for("nodejs.util.inspect.custom")]() {
        return "KramaId(" + this.value + ")";
    }

    public static async peerIdFromPrivateKey(privateKey: Uint8Array): Promise<PeerId> {
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
    public static async fromPrivateKey(kind: KramaIdKind, version: KramaIdVersion.V0, zone: NetworkZone, privateKey: Uint8Array | Hex): Promise<KramaId> {
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
    public static fromPeerId(kind: KramaIdKind, version: KramaIdVersion, zone: NetworkZone, peerId: string | PeerId): KramaId {
        const tag = new KramaIdTag((kind << 4) | version);
        const metadata = zone << 4;
        const encoded = encodeBase58(new Uint8Array([tag.value, metadata]));
        const peerIdString = typeof peerId === "string" ? peerId : peerId.toB58String();

        return new KramaId(encoded + peerIdString);
    }
}
