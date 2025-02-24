import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
/**
 * Represents an asset identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 */
export declare class AssetId extends Identifier {
    constructor(value: Uint8Array | Hex | Identifier);
    /**
     * Retrieves the standard of the asset.
     *
     * This method extracts a 16-bit unsigned integer from the byte representation
     * of the asset, starting from the 3rd byte (index 2) to the 4th byte (index 3).
     * The extracted value represents the asset standard.
     *
     * @returns {AssetStandard} The standard of the asset as a 16-bit unsigned integer.
     */
    getStandard(): number;
    /**
     * Validates the given asset identifier.
     *
     * @param value - The asset identifier to validate. It can be either a `Uint8Array` or a hexadecimal string.
     * @returns An `InvalidReason` object containing the reason why the identifier is invalid, or `null` if the identifier is valid.
     */
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    /**
     * Checks if the given value is a valid asset identifier.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns `true` if the value is valid, otherwise `false`.
     */
    static isValid(value: Uint8Array | Hex): boolean;
}
//# sourceMappingURL=asset-id.d.ts.map