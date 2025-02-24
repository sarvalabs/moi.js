"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KramaId = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const peer_id_1 = require("peer-id");
const utils_1 = require("../utils");
const krama_id_enums_1 = require("./krama-id-enums");
const krama_id_metadata_1 = require("./krama-id-metadata");
const krama_id_tag_1 = require("./krama-id-tag");
/**
 * KramaId is a unique identifier for a guardian node.
 */
class KramaId {
    value;
    constructor(value) {
        this.value = value;
    }
    getPeerIdLength(tag) {
        switch (tag.getKind()) {
            case krama_id_enums_1.KramaIdKind.Guardian:
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
        const decoded = (0, utils_1.decodeBase58)(this.value.slice(0, 2));
        return new krama_id_tag_1.KramaIdTag(decoded[0]);
    }
    /**
     * Retrieves the metadata associated with the Krama ID.
     *
     * @returns {KramaIdMetadata} The metadata object containing information about the Krama ID.
     */
    getMetadata() {
        const decoded = (0, utils_1.decodeBase58)(this.value.slice(0, 2));
        return new krama_id_metadata_1.KramaIdMetadata(decoded[1]);
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
        return (0, peer_id_1.createFromB58String)(this.getPeerId());
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
        const compressedPubKey = new elliptic_1.default.ec("secp256k1").keyFromPrivate(privateKey).getPublic(true, "array");
        const raw = new Uint8Array([0, 37, 8, 2, 18, 33, ...compressedPubKey]);
        return await (0, peer_id_1.createFromPubKey)(raw);
    }
    /**
     * Creates a `KramaId` instance from a given private key.
     *
     * @param zone - The network zone to which the `KramaId` belongs.
     * @param privateKey - The private key used to generate the `KramaId`. It can be a `Uint8Array` or a hexadecimal string.
     * @returns A promise that resolves to a `KramaId` instance.
     */
    static async fromPrivateKey(kind, version, zone, privateKey) {
        const pKey = typeof privateKey === "string" ? (0, utils_1.hexToBytes)(privateKey) : privateKey;
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
        const tag = new krama_id_tag_1.KramaIdTag((kind << 4) | version);
        const metadata = zone << 4;
        const encoded = (0, utils_1.encodeBase58)(new Uint8Array([tag.value, metadata]));
        const peerIdString = typeof peerId === "string" ? peerId : peerId.toB58String();
        return new KramaId(encoded + peerIdString);
    }
}
exports.KramaId = KramaId;
//# sourceMappingURL=krama-id.js.map