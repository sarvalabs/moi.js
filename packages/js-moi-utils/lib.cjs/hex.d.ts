import BN from "bn.js";
import { Buffer } from "buffer";
import type { Hex } from "../types/hex";
export type NumberLike = string | number | bigint | BN | Buffer | Uint8Array | number[];
/**
 * Converts a number, bigint, or BN instance to a hexadecimal string representation.
 * If the input value is not already a BN instance, it is converted to one.
 * Throws an error if the input value is a negative number.
 *
 * @param {NumberLike} value - The value to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the value.
 * @throws {Error} If the input value is a negative number.
 */
export declare const numToHex: (value: NumberLike) => string;
/**
 * Converts a number, bigint, or BN instance to a quantity string representation.
 * The quantity string is prefixed with "0x" and is obtained by calling `numToHex` function.
 *
 * @param {NumberLike} value - The value to convert to a quantity string.
 * @returns {string} - The quantity string representation of the value.
 * @throws {Error} If an error occurs during the conversion.
 */
export declare const toQuantity: (value: NumberLike) => string;
/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
export declare const encodeToString: (data: Uint8Array) => string;
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
export declare const bytesToHex: (data: Uint8Array) => string;
/**
 * Checks if a given string is a valid hexadecimal value.
 *
 * @param {string} value - The input string.
 * @returns {boolean} True if the input is a valid hexadecimal string, false otherwise.
 */
export declare const isHex: (value: unknown) => value is Hex;
/**
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} data - The input string.
 * @returns {string} The trimmed hexadecimal string.
 */
export declare const trimHexPrefix: (data: string) => string;
//# sourceMappingURL=hex.d.ts.map