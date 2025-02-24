import type { InvalidReason } from "../identifier";
import { KramaIdKind } from "./krama-id-enums";
/**
 * KramaIdTag provides a way to extract the kind and version of a Krama ID.
 */
export declare class KramaIdTag {
    /**
     * The numeric value associated with the Krama ID tag.
     * This value is read-only and cannot be modified after initialization.
     */
    readonly value: number;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    /**
     * Retrieves the kind of the Krama ID.
     *
     * @returns {KramaIdKind} The kind of the Krama ID, derived by shifting the value 4 bits to the right.
     */
    getKind(): KramaIdKind;
    /**
     * Retrieves the version number from the value.
     *
     * The version number is extracted by performing a bitwise AND operation
     * with the value `0x0f`, which isolates the lower 4 bits of the value.
     *
     * @returns {number} The version number.
     */
    getVersion(): number;
    /**
     * Validates a given KramaIdTag.
     *
     * @param tag - The KramaIdTag to validate.
     * @returns An InvalidReason object if the tag is invalid, or null if the tag is valid.
     */
    static validate(tag: KramaIdTag): InvalidReason | null;
}
//# sourceMappingURL=krama-id-tag.d.ts.map