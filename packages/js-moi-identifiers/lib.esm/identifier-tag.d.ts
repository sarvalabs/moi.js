import { IdentifierKind, type IdentifierVersion } from "./enums";
import type { InvalidReason } from "./identifier";
/**
 * Represents an identifier tag with a specific kind and version.
 * The `IdentifierTag` class encapsulates an identifier value, which includes a kind and a version.
 */
export declare class IdentifierTag {
    /**
     * The numeric value associated with the identifier tag.
     * This value is read-only and cannot be modified after initialization.
     */
    readonly value: number;
    private static MAX_IDENTIFIER_KIND;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    /**
     * Retrieves the kind of the identifier.
     *
     * @returns {IdentifierKind} The kind of the identifier.
     */
    getKind(): IdentifierKind;
    /**
     * Retrieves the version of the identifier tag.
     *
     * @returns {number} The version number of the identifier tag.
     */
    getVersion(): number;
    /**
     * Retrieves the kind of identifier from the given numeric value.
     *
     * @param value - The numeric value from which to extract the identifier kind.
     * @returns The identifier kind derived from the given value.
     */
    static getKind(value: number): IdentifierKind;
    /**
     * Extracts the version number from the given value.
     *
     * @param value - The number from which to extract the version.
     * @returns The extracted version number.
     */
    static getVersion(value: number): number;
    /**
     * Retrieves the maximum supported version for a given identifier kind.
     *
     * @param kind - The kind of identifier for which to get the maximum supported version.
     * @returns The maximum supported version number for the specified identifier kind.
     */
    static getMaxSupportedVersion(kind: IdentifierKind): number;
    /**
     * Generates an `IdentifierTag` based on the provided `kind` and `version`.
     *
     * @param kind - The kind of identifier.
     * @param version - The version of the identifier.
     * @returns An `IdentifierTag` instance created from the combined `kind` and `version`.
     */
    static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag;
    /**
     * Validates the given identifier value.
     *
     * @param value - The identifier value to validate.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or `null` if the identifier is valid.
     */
    static validate(value: number): InvalidReason | null;
}
//# sourceMappingURL=identifier-tag.d.ts.map