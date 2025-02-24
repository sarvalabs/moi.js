import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
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
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    static isValid(value: Uint8Array | Hex): boolean;
}
//# sourceMappingURL=asset-id.d.ts.map