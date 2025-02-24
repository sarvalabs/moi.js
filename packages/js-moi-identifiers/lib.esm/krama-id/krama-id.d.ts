import PeerId from "peer-id";
import { type Hex } from "../utils";
import { KramaIdKind, KramaIdVersion, NetworkZone } from "./krama-id-enums";
import { KramaIdMetadata } from "./krama-id-metadata";
import { KramaIdTag } from "./krama-id-tag";
/**
 * KramaId is a unique identifier for a guardian node.
 */
export declare class KramaId {
    private readonly value;
    constructor(value: string);
    private getPeerIdLength;
    /**
     * Retrieves the tag associated with the Krama ID.
     *
     * @returns {KramaIdTag} The tag derived from the first byte of the decoded value.
     */
    getTag(): KramaIdTag;
    /**
     * Retrieves the metadata associated with the Krama ID.
     *
     * @returns {KramaIdMetadata} The metadata object containing information about the Krama ID.
     */
    getMetadata(): KramaIdMetadata;
    /**
     * Retrieves the peer ID by slicing the value based on the calculated peer ID length.
     *
     * @returns The peer ID extracted from the value.
     */
    getPeerId(): string;
    /**
     * Asynchronously retrieves and decodes the peer ID.
     *
     * @returns A promise that resolves to the decoded peer ID.
     */
    getDecodedPeerId(): PeerId;
    toString(): string;
    toJSON(): string;
    static peerIdFromPrivateKey(privateKey: Uint8Array): Promise<PeerId>;
    /**
     * Creates a `KramaId` instance from a given private key.
     *
     * @param zone - The network zone to which the `KramaId` belongs.
     * @param privateKey - The private key used to generate the `KramaId`. It can be a `Uint8Array` or a hexadecimal string.
     * @returns A promise that resolves to a `KramaId` instance.
     */
    static fromPrivateKey(kind: KramaIdKind, version: KramaIdVersion.V0, zone: NetworkZone, privateKey: Uint8Array | Hex): Promise<KramaId>;
    /**
     * Creates a new KramaId instance from the given peer ID.
     *
     * @param kind - The kind of KramaId.
     * @param version - The version number.
     * @param zone - The network zone.
     * @param peerId - The peer ID string.
     * @returns A new KramaId instance.
     */
    static fromPeerId(kind: KramaIdKind, version: KramaIdVersion, zone: NetworkZone, peerId: string | PeerId): KramaId;
}
//# sourceMappingURL=krama-id.d.ts.map