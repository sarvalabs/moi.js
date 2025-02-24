import type { IdentifierKind, IdentifierVersion } from "./enums";
import { getFlag, setFlag, type Flag } from "./flags";
import { IdentifierTag } from "./identifier-tag";
import { bytesToHex, hexToBytes, type Hex } from "./utils";

export interface InvalidReason {
    why: string;
}

export class Identifier {
    private readonly value: Uint8Array;

    constructor(value: Uint8Array | Hex | Identifier) {
        value = value instanceof Uint8Array ? value : value instanceof Identifier ? value.toBytes() : hexToBytes(value);

        if (value.length !== 32) {
            throw new TypeError("Invalid identifier length. Expected 32 bytes.");
        }

        this.value = value;
    }

    /**
     * Generates a fingerprint for the identifier.
     *
     * The fingerprint is a subset of the byte representation of the identifier,
     * starting from the 5th byte (index 4) and ending at the 28th byte (index 27).
     *
     * @returns {Uint8Array} The fingerprint as a Uint8Array.
     */
    public getFingerprint(): Uint8Array {
        return this.toBytes().slice(4, 28);
    }

    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier.
     */
    public getTag(): IdentifierTag {
        return Identifier.getTag(this.value);
    }

    /**
     * Retrieves the kind of the identifier.
     *
     * @returns The kind of the identifier.
     */
    public getKind(): IdentifierKind {
        return this.getTag().getKind();
    }

    /**
     * Retrieves the version of the identifier.
     *
     * @returns The version of the identifier.
     */
    public getVersion(): IdentifierVersion {
        return this.getTag().getVersion();
    }

    /**
     * Retrieves the flags of the identifier.
     *
     * @returns The flags of the identifier.
     */
    public getFlags(): number {
        return this.value[1];
    }

    /**
     * Creates a new variant of the identifier.
     *
     * @param variant - The new variant number.
     * @param set - The flags to set.
     * @param unset - The flags to unset.
     *
     * @returns A new identifier with the specified variant and flags.
     */
    public createNewVariant(variant: number, set?: Flag[], unset?: Flag[]): Identifier {
        const newVariant = this.toBytes();
        new DataView(newVariant.buffer).setUint32(28, variant, false);

        for (const flag of set ?? []) {
            if (!flag.supports(Identifier.getTag(newVariant))) {
                throw new Error(`Invalid flag. Unsupported flag for identifier.`);
            }

            newVariant[1] = setFlag(newVariant[1], flag.index, true);
        }

        for (const flag of unset ?? []) {
            if (!flag.supports(Identifier.getTag(newVariant))) {
                throw new Error(`Invalid flag. Unsupported flag for identifier.`);
            }

            newVariant[1] = setFlag(newVariant[1], flag.index, false);
        }

        // We need to create a new instance of the identifier with the new variant.
        // This is tricky because we need to create the instance of parent class without knowing the exact class.
        return new (this.constructor as new (value: Uint8Array) => Identifier)(newVariant);
    }

    /**
     * Retrieves the metadata from the identifier's value.
     *
     * @returns The metadata as a Uint8Array.
     */
    public getMetadata(): Uint8Array {
        return new Uint8Array([this.value[2], this.value[3]]);
    }

    /**
     * Retrieves the variant number from the identifier's value.
     *
     * The variant is extracted from a specific slice of the identifier's value,
     * starting at byte 28 and interpreted as a 32-bit unsigned integer in big-endian order.
     *
     * @returns {number} The variant number.
     */
    public getVariant(): number {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }

    /**
     * Checks if the current identifier has the specified flag.
     *
     * @param flag - The flag to check against the identifier.
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    public hasFlag(flag: Flag): boolean {
        return flag.supports(this.getTag()) || getFlag(this.value[1], flag.index);
    }

    /**
     * Converts the current value to a byte array.
     *
     * @returns {Uint8Array} A new Uint8Array containing the bytes of the current value.
     */
    public toBytes(): Uint8Array {
        return this.value.slice();
    }

    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier value.
     */
    public toHex(): Hex {
        return bytesToHex(this.value);
    }

    public toString(): string {
        return this.toHex();
    }

    public toJSON(): string {
        return this.toString();
    }

    [Symbol.for("nodejs.util.inspect.custom")](): string {
        return `Identifier(${this.toString()})`;
    }

    /**
     * Retrieves the tag from the given identifier value.
     *
     * @param value - The identifier value as a Uint8Array. Must be 32 bytes in length.
     * @returns An instance of IdentifierTag representing the tag of the identifier.
     * @throws {Error} If the length of the identifier value is not 32 bytes.
     */
    protected static getTag(value: Uint8Array): IdentifierTag {
        return new IdentifierTag(value[0]);
    }
}

/**
 * Checks if the given value is an identifier.
 *
 * @param value - The value to check.
 * @returns True if the value is an instance of `BaseIdentifier`, otherwise false.
 */
export const isIdentifier = (value: unknown): value is Identifier => {
    return value instanceof Identifier;
};
