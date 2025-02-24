import BN from "bn.js";
export type Hex = `0x${string}`;
/**
 * A type representing a number in hexadecimal format.
 */
export type Quantity = Hex;
export type Address = Hex;
export type NumberLike = string | number | bigint | BN | Uint8Array | number[];
/**
 * Ensures that a given string has the '0x' prefix.
 * If the string already has the prefix, it is returned as is.
 * Otherwise, the prefix is added to the string.
 *
 * @param {string} hex - The input string.
 * @returns {Hex} The string with the '0x' prefix.
 */
export declare const ensureHexPrefix: (hex: string) => Hex;
/**
 * Converts a number, bigint, or BN instance to a hexadecimal string representation.
 * If the input value is not already a BN instance, it is converted to one.
 * Throws an error if the input value is a negative number.
 *
 * @param {NumberLike} value - The value to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the value.
 * @throws {Error} If the input value is a negative number.
 */
export declare const numToHex: (value: NumberLike) => Hex;
/**
 * @deprecated Use `numToHex` instead.
 *
 * Converts a number, bigint, or BN instance to a quantity string representation.
 * The quantity string is prefixed with "0x" and is obtained by calling `numToHex` function.
 *
 * @param {NumberLike} value - The value to convert to a quantity string.
 * @returns {Hex} - The quantity string representation of the value.
 * @throws {Error} If an error occurs during the conversion.
 */
export declare const toQuantity: (value: NumberLike) => Hex;
/**
 * @deprecated Use `bytesToHex` instead.
 *
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {Hex} The hexadecimal string representation of the Uint8Array.
 */
export declare const encodeToString: (data: Uint8Array) => Hex;
/**
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} If the input string is not a valid hexadecimal string.
 */
export declare const hexToBytes: (str: string) => Uint8Array;
/**
 * Converts a hexadecimal string to a bigint or number.
 * If the resulting value is too large to fit in a number, it is returned as a BigInt.
 * Otherwise, it is returned as a number.
 *
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {bigint | number} The resulting value as a bigint or number.
 */
export declare const hexToBN: (hex: string) => bigint | number;
/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
export declare const bytesToHex: (data: Uint8Array) => Hex;
/**
 * Checks if a given value is a hexadecimal string.
 * Optionally, the length of the hexadecimal string can be specified.
 *
 * @param {unknown} value - The value to check.
 * @param {number} byteLength - The length of the in terms of bytes l.
 * @returns {boolean} True if the value is a hexadecimal string, false otherwise.
 */
export declare const isHex: (value: unknown, byteLength?: number) => value is Hex;
/**
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} data - The input string.
 * @returns {string} The trimmed hexadecimal string.
 */
export declare const trimHexPrefix: (data: string) => string;
/**
 * Checks if a given value is an address.
 *
 * @param {unknown} value - The value to check.
 * @returns {boolean} True if the value is an address, false otherwise.

/**
 * Converts a hexadecimal string to a hash using the BLAKE2b cryptographic hash function.
 *
 * @param hex - The hexadecimal string to be hashed.
 * @returns The resulting hash as a hexadecimal string.
 */
export declare const hexToHash: (hex: Hex | Uint8Array) => Hex;
/**
 * Checks if the given Uint8Array consists entirely of null bytes (0x00).
 *
 * @param bytes - The Uint8Array to check.
 * @returns `true` if all bytes are null (0x00), otherwise `false`.
 */
export declare const isNullBytes: (bytes: Uint8Array) => boolean;
//# sourceMappingURL=hex.d.ts.map