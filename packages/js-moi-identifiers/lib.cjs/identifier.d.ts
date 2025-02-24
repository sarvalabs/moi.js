import type { IdentifierKind, IdentifierVersion } from "./enums";
import { type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import { type Hex } from "./utils";
export interface InvalidReason {
    why: string;
}
export declare class Identifier {
    private readonly value;
    constructor(value: Uint8Array | Hex | Identifier);
    /**
     * Generates a fingerprint for the identifier.
     *
     * The fingerprint is a subset of the byte representation of the identifier,
     * starting from the 5th byte (index 4) and ending at the 28th byte (index 27).
     *
     * @returns {Uint8Array} The fingerprint as a Uint8Array.
     */
    getFingerprint(): Uint8Array;
    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier.
     */
    getTag(): IdentifierTag;
    /**
     * Retrieves the kind of the identifier.
     *
     * @returns The kind of the identifier.
     */
    getKind(): IdentifierKind;
    /**
     * Retrieves the version of the identifier.
     *
     * @returns The version of the identifier.
     */
    getVersion(): IdentifierVersion;
    /**
     * Retrieves the flags of the identifier.
     *
     * @returns The flags of the identifier.
     */
    getFlags(): number;
    /**
     * Creates a new variant of the identifier.
     *
     * @param variant - The new variant number.
     * @param set - The flags to set.
     * @param unset - The flags to unset.
     *
     * @returns A new identifier with the specified variant and flags.
     */
    createNewVariant(variant: number, set?: Flag[], unset?: Flag[]): Identifier;
    /**
     * Retrieves the metadata from the identifier's value.
     *
     * @returns The metadata as a Uint8Array.
     */
    getMetadata(): Uint8Array;
    /**
     * Retrieves the variant number from the identifier's value.
     *
     * The variant is extracted from a specific slice of the identifier's value,
     * starting at byte 28 and interpreted as a 32-bit unsigned integer in big-endian order.
     *
     * @returns {number} The variant number.
     */
    getVariant(): number;
    /**
     * Checks if the current identifier has the specified flag.
     *
     * @param flag - The flag to check against the identifier.
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    hasFlag(flag: Flag): boolean;
    /**
     * Converts the current value to a byte array.
     *
     * @returns {Uint8Array} A new Uint8Array containing the bytes of the current value.
     */
    toBytes(): Uint8Array;
    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier value.
     */
    toHex(): Hex;
    toString(): string;
    toJSON(): string;
    /**
     * Retrieves the tag from the given identifier value.
     *
     * @param value - The identifier value as a Uint8Array. Must be 32 bytes in length.
     * @returns An instance of IdentifierTag representing the tag of the identifier.
     * @throws {Error} If the length of the identifier value is not 32 bytes.
     */
    protected static getTag(value: Uint8Array): IdentifierTag;
}
/**
 * Checks if the given value is an identifier.
 *
 * @param value - The value to check.
 * @returns True if the value is an instance of `BaseIdentifier`, otherwise false.
 */
export declare const isIdentifier: (value: unknown) => value is Identifier;
//# sourceMappingURL=identifier.d.ts.map