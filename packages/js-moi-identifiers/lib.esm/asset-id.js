import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { Identifier } from "./identifier";
import { hexToBytes } from "./utils";
/**
 * Represents an asset identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 */
export class AssetId extends Identifier {
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
    /**
     * Validates the given asset identifier.
     *
     * @param value - The asset identifier to validate. It can be either a `Uint8Array` or a hexadecimal string.
     * @returns An `InvalidReason` object containing the reason why the identifier is invalid, or `null` if the identifier is valid.
     */
    static validate(value) {
        const asset = value instanceof Uint8Array ? value : hexToBytes(value);
        if (asset.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== IdentifierKind.Asset) {
            return { why: "Invalid identifier kind. Expected a asset identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    /**
     * Checks if the given value is a valid asset identifier.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns `true` if the value is valid, otherwise `false`.
     */
    static isValid(value) {
        return this.validate(value) === null;
    }
}
//# sourceMappingURL=asset-id.js.map