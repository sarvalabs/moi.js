"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KramaId = exports.KramaIdTag = exports.KramaIdV0 = exports.KramaIdKind = exports.NetworkZone = void 0;
const bs58_1 = __importDefault(require("bs58"));
const utils_1 = require("./utils");
var NetworkZone;
(function (NetworkZone) {
    NetworkZone[NetworkZone["Zone0"] = 0] = "Zone0";
    NetworkZone[NetworkZone["Zone1"] = 1] = "Zone1";
    NetworkZone[NetworkZone["Zone2"] = 2] = "Zone2";
    NetworkZone[NetworkZone["Zone3"] = 3] = "Zone3";
})(NetworkZone || (exports.NetworkZone = NetworkZone = {}));
var KramaIdKind;
(function (KramaIdKind) {
    KramaIdKind[KramaIdKind["Guardian"] = 0] = "Guardian";
})(KramaIdKind || (exports.KramaIdKind = KramaIdKind = {}));
exports.KramaIdV0 = 0;
class KramaIdTag {
    value;
    static kindMaxSupportedVersion = {
        [KramaIdKind.Guardian]: exports.KramaIdV0,
    };
    constructor(value) {
        this.value = value;
        const error = KramaIdTag.validate(this);
        if (error) {
            throw new Error(`Invalid KramaIdTag: ${error.why}`);
        }
    }
    getKind() {
        return this.value >> 4;
    }
    getVersion() {
        return this.value & 0x0f;
    }
    static validate(tag) {
        if (tag.getKind() > KramaIdKind.Guardian) {
            return { why: "Unsupported KramaId kind" };
        }
        if (tag.getVersion() > this.kindMaxSupportedVersion[tag.getKind()]) {
            return { why: "Unsupported KramaId version" };
        }
        return null;
    }
}
exports.KramaIdTag = KramaIdTag;
class KramaIdMetadata {
    value;
    constructor(value) {
        this.value = value;
        if (this.getZone() > NetworkZone.Zone3) {
            throw new Error("Invalid network zone");
        }
    }
    getZone() {
        return this.value >> 4;
    }
}
class KramaId {
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
    getTag() {
        const decoded = bs58_1.default.decode(this.value.slice(0, 2));
        return new KramaIdTag(decoded[0]);
    }
    getMetadata() {
        const decoded = bs58_1.default.decode(this.value.slice(0, 2));
        return new KramaIdMetadata(decoded[1]);
    }
    getPeerId() {
        const length = this.getPeerIdLength(this.getTag());
        return this.value.slice(-length);
    }
    async getDecodedPeerId() {
        const peerId = await import("@libp2p/peer-id");
        return peerId.peerIdFromString(this.getPeerId());
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
        const [{ keys }, { peerIdFromPrivateKey }] = await Promise.all([import("@libp2p/crypto"), import("@libp2p/peer-id")]);
        return peerIdFromPrivateKey(keys.privateKeyFromRaw(privateKey));
    }
    static async fromPrivateKey(zone, privateKey) {
        const pKey = typeof privateKey === "string" ? (0, utils_1.hexToBytes)(privateKey) : privateKey;
        const peerId = await KramaId.peerIdFromPrivateKey(pKey);
        return this.fromPeerId(KramaIdKind.Guardian, exports.KramaIdV0, zone, peerId.toString());
    }
    static fromPeerId(kind, version, zone, peerId) {
        const tag = new KramaIdTag((kind << 4) | version);
        const metadata = zone << 4;
        const encoded = bs58_1.default.encode([tag.value, metadata]);
        return new KramaId(encoded + peerId);
    }
}
exports.KramaId = KramaId;
//# sourceMappingURL=krama-id.js.map