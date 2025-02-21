import { IdentifierKind, type IdentifierVersion } from "./enums";
import type { InvalidReason } from "./identifier";

/**
 * Represents an identifier tag with a specific kind and version.
 * The `IdentifierTag` class encapsulates an identifier value, which includes a kind and a version.
 */
export class IdentifierTag {
    /**
     * The numeric value associated with the identifier tag.
     * This value is read-only and cannot be modified after initialization.
     */
    public readonly value: number;

    private static MAX_IDENTIFIER_KIND = IdentifierKind.Logic;

    private static kindMaxSupportedVersion: Record<IdentifierKind, number> = {
        [IdentifierKind.Participant]: 0,
        [IdentifierKind.Asset]: 0,
        [IdentifierKind.Logic]: 0,
    };

    constructor(value: number) {
        const validation = IdentifierTag.validate(value);

        if (validation) {
            throw new Error(`Invalid identifier value. ${validation.why}`);
        }

        this.value = value;
    }

    /**
     * Retrieves the kind of the identifier.
     *
     * @returns {IdentifierKind} The kind of the identifier.
     */
    public getKind(): IdentifierKind {
        return IdentifierTag.getKind(this.value);
    }

    /**
     * Retrieves the version of the identifier tag.
     *
     * @returns {number} The version number of the identifier tag.
     */
    public getVersion(): number {
        return IdentifierTag.getVersion(this.value);
    }

    /**
     * Retrieves the kind of identifier from the given numeric value.
     *
     * @param value - The numeric value from which to extract the identifier kind.
     * @returns The identifier kind derived from the given value.
     */
    public static getKind(value: number): IdentifierKind {
        return value >> 4;
    }

    /**
     * Extracts the version number from the given value.
     *
     * @param value - The number from which to extract the version.
     * @returns The extracted version number.
     */
    public static getVersion(value: number): number {
        return value & 0x0f;
    }

    /**
     * Retrieves the maximum supported version for a given identifier kind.
     *
     * @param kind - The kind of identifier for which to get the maximum supported version.
     * @returns The maximum supported version number for the specified identifier kind.
     */
    public static getMaxSupportedVersion(kind: IdentifierKind): number {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }

    /**
     * Generates an `IdentifierTag` based on the provided `kind` and `version`.
     *
     * @param kind - The kind of identifier.
     * @param version - The version of the identifier.
     * @returns An `IdentifierTag` instance created from the combined `kind` and `version`.
     */
    public static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag {
        return new IdentifierTag((kind << 4) | version);
    }

    /**
     * Validates the given identifier value.
     *
     * @param value - The identifier value to validate.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or `null` if the identifier is valid.
     */
    public static validate(value: number): InvalidReason | null {
        if (IdentifierTag.getKind(value) > this.MAX_IDENTIFIER_KIND) {
            return { why: "Unsupported identifier kind." };
        }

        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }

        return null;
    }
}
