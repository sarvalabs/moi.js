export type Hex = `0x${string}`;
/**
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} If the input string is not a valid hexadecimal string.
 */
export declare const hexToBytes: (str: string) => Uint8Array;
/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
export declare const bytesToHex: (data: Uint8Array) => Hex;
export declare const encodeBase58: (uint8Array: Uint8Array) => string;
export declare const decodeBase58: (base58String: string) => Uint8Array;
//# sourceMappingURL=utils.d.ts.map