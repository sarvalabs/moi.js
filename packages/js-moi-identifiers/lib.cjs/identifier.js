"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIdentifier = exports.Identifier = void 0;
const flags_1 = require("./flags");
const identifier_tag_1 = require("./identifier-tag");
const utils_1 = require("./utils");
/**
 * Represents an identifier with a fixed length of 32 bytes.
 *
 * The `Identifier` class provides methods to manipulate and retrieve information
 * from the identifier, such as its fingerprint, tag, kind, version, flags, metadata,
 * and variant. It also allows creating new variants of the identifier with specified
 * flags.
 */
class Identifier {
    value;
    /**
     * Creates a new instance of the `Identifier` class.
     *
     * @param value - The identifier value as a `Uint8Array`, `Hex`, or `Identifier`.
     */
    constructor(value) {
        value = value instanceof Uint8Array ? value : value instanceof Identifier ? value.toBytes() : (0, utils_1.hexToBytes)(value);
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
    getFingerprint() {
        return this.toBytes().slice(4, 28);
    }
    /**
     * Retrieves the tag associated with the current identifier.
     *
     * @returns {IdentifierTag} The tag of the identifier.
     */
    getTag() {
        return Identifier.getTag(this.value);
    }
    /**
     * Retrieves the kind of the identifier.
     *
     * @returns The kind of the identifier.
     */
    getKind() {
        return this.getTag().getKind();
    }
    /**
     * Retrieves the version of the identifier.
     *
     * @returns The version of the identifier.
     */
    getVersion() {
        return this.getTag().getVersion();
    }
    /**
     * Retrieves the flags of the identifier.
     *
     * @returns The flags of the identifier.
     */
    getFlags() {
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
    createNewVariant(variant, set, unset) {
        const newVariant = this.toBytes();
        new DataView(newVariant.buffer).setUint32(28, variant, false);
        for (const flag of set ?? []) {
            if (!flag.supports(Identifier.getTag(newVariant))) {
                throw new Error(`Invalid flag. Unsupported flag for identifier.`);
            }
            newVariant[1] = (0, flags_1.setFlag)(newVariant[1], flag.index, true);
        }
        for (const flag of unset ?? []) {
            if (!flag.supports(Identifier.getTag(newVariant))) {
                throw new Error(`Invalid flag. Unsupported flag for identifier.`);
            }
            newVariant[1] = (0, flags_1.setFlag)(newVariant[1], flag.index, false);
        }
        // We need to create a new instance of the identifier with the new variant.
        // This is tricky because we need to create the instance of parent class without knowing the exact class.
        return new this.constructor(newVariant);
    }
    /**
     * Retrieves the metadata from the identifier's value.
     *
     * @returns The metadata as a Uint8Array.
     */
    getMetadata() {
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
    getVariant() {
        const blob = new Uint8Array(this.value.slice(28));
        return new DataView(blob.buffer).getUint32(0, false);
    }
    /**
     * Checks if the current identifier has the specified flag.
     *
     * @param flag - The flag to check against the identifier.
     * @returns `true` if the identifier has the specified flag, otherwise `false`.
     */
    hasFlag(flag) {
        return flag.supports(this.getTag()) || (0, flags_1.getFlag)(this.value[1], flag.index);
    }
    /**
     * Converts the current value to a byte array.
     *
     * @returns {Uint8Array} A new Uint8Array containing the bytes of the current value.
     */
    toBytes() {
        return this.value.slice();
    }
    /**
     * Converts the identifier value to a hexadecimal string.
     *
     * @returns {Hex} The hexadecimal representation of the identifier value.
     */
    toHex() {
        return (0, utils_1.bytesToHex)(this.value);
    }
    toString() {
        return this.toHex();
    }
    toJSON() {
        return this.toString();
    }
    [Symbol.for("nodejs.util.inspect.custom")]() {
        return `Identifier(${this.toString()})`;
    }
    /**
     * Retrieves the tag from the given identifier value.
     *
     * @param value - The identifier value as a Uint8Array. Must be 32 bytes in length.
     * @returns An instance of IdentifierTag representing the tag of the identifier.
     * @throws {Error} If the length of the identifier value is not 32 bytes.
     */
    static getTag(value) {
        return new identifier_tag_1.IdentifierTag(value[0]);
    }
}
exports.Identifier = Identifier;
/**
 * Checks if the given value is an identifier.
 *
 * @param value - The value to check.
 * @returns True if the value is an instance of `Identifier`, otherwise false.
 */
const isIdentifier = (value) => {
    return value instanceof Identifier;
};
exports.isIdentifier = isIdentifier;
//# sourceMappingURL=identifier.js.map