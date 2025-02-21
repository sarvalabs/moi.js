import type { InvalidReason } from "../identifier";
import { KramaIdKind, KramaIdVersion } from "./krama-id-enums";

/**
 * KramaIdTag provides a way to extract the kind and version of a Krama ID.
 */
export class KramaIdTag {
    /**
     * The numeric value associated with the Krama ID tag.
     * This value is read-only and cannot be modified after initialization.
     */
    public readonly value: number;

    private static kindMaxSupportedVersion: Record<KramaIdKind, number> = {
        [KramaIdKind.Guardian]: KramaIdVersion.V0,
    };

    constructor(value: number) {
        this.value = value;

        const error = KramaIdTag.validate(this);

        if (error) {
            throw new Error(`Invalid KramaIdTag: ${error.why}`);
        }
    }

    /**
     * Retrieves the kind of the Krama ID.
     *
     * @returns {KramaIdKind} The kind of the Krama ID, derived by shifting the value 4 bits to the right.
     */
    public getKind(): KramaIdKind {
        return this.value >> 4;
    }

    /**
     * Retrieves the version number from the value.
     *
     * The version number is extracted by performing a bitwise AND operation
     * with the value `0x0f`, which isolates the lower 4 bits of the value.
     *
     * @returns {number} The version number.
     */
    public getVersion(): number {
        return this.value & 0x0f;
    }

    /**
     * Validates a given KramaIdTag.
     *
     * @param tag - The KramaIdTag to validate.
     * @returns An InvalidReason object if the tag is invalid, or null if the tag is valid.
     */
    public static validate(tag: KramaIdTag): InvalidReason | null {
        if (tag.getKind() > KramaIdKind.Guardian) {
            return { why: "Unsupported KramaId kind" };
        }

        if (tag.getVersion() > this.kindMaxSupportedVersion[tag.getKind()]) {
            return { why: "Unsupported KramaId version" };
        }

        return null;
    }
}
