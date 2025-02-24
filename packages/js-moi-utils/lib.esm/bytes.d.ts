export type Bytes = ArrayLike<number>;
/**
 * Checks if the given value is an integer.
 *
 * @param value - The value to check.
 * @returns Returns true if the value is an integer, otherwise false.
 */
export declare const isInteger: (value: number) => boolean;
/**
 * Checks if the given value is a valid byte array.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid byte array, otherwise false.
 */
export declare const isBytes: (value: any) => value is Bytes;
/**
 * Calculates the length of the data represented by a hexadecimal string.
 *
 * @param {string} data - The hexadecimal string.
 * @returns {number | null} - The length of the data, or null if the input is
 * not a valid hexadecimal string.
 */
export declare const hexDataLength: (data: string) => number | null;
/**
 * Checks if the given value is a valid hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @param {number} length - Optional. The expected length of the hexadecimal string.
 * @returns {boolean} Returns true if the value is a valid hexadecimal string, otherwise false.
 */
export declare const isHexString: (value: any, length?: number) => boolean;
/**
 * Generates a Uint8Array of the specified size filled with cryptographically secure random bytes.
 *
 * @param size - The number of random bytes to generate.
 * @returns A Uint8Array containing the generated random bytes.
 */
export declare const randomBytes: (size: number) => Uint8Array;
/**
 * Encodes a given text string into a Uint8Array using the TextEncoder API.
 *
 * @param text - The text string to be encoded.
 * @returns A Uint8Array containing the encoded text.
 */
export declare const encodeText: (text: string) => Uint8Array<ArrayBufferLike>;
/**
 * Decodes a Uint8Array into a string using the TextDecoder API.
 *
 * @param data - The Uint8Array to decode.
 * @returns The decoded string.
 */
export declare const decodeText: (data: Uint8Array) => string;
/**
 * Concatenates multiple Uint8Array instances into a single Uint8Array.
 *
 * @param {...Uint8Array[]} arrays - The arrays to concatenate.
 * @returns {Uint8Array} A new Uint8Array containing the concatenated values.
 */
export declare const concatBytes: (...arrays: Uint8Array[]) => Uint8Array;
//# sourceMappingURL=bytes.d.ts.map