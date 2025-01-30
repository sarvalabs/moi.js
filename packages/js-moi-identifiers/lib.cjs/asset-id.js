"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetId = void 0;
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const utils_1 = require("./utils");
class AssetId extends identifier_1.Identifier {
    constructor(value) {
        super(value);
        const error = AssetId.validate(this.toBytes());
        if (error) {
            throw new TypeError(`Invalid asset identifier. ${error.why}`);
        }
    }
    /**
     * Retrieves the standard of the asset.
     *
     * This method extracts a 16-bit unsigned integer from the byte representation
     * of the asset, starting from the 3rd byte (index 2) to the 4th byte (index 3).
     * The extracted value represents the asset standard.
     *
     * @returns {AssetStandard} The standard of the asset as a 16-bit unsigned integer.
     */
    getStandard() {
        return new DataView(this.toBytes().slice(2, 4).buffer).getUint16(0, false);
    }
    static validate(value) {
        const asset = value instanceof Uint8Array ? value : (0, utils_1.hexToBytes)(value);
        if (asset.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Asset) {
            return { why: "Invalid identifier kind. Expected a asset identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    static isValid(value) {
        return this.validate(value) === null;
    }
}
exports.AssetId = AssetId;
//# sourceMappingURL=asset-id.js.map