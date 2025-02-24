export type Hex = `0x${string}`;

/**
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} If the input string is not a valid hexadecimal string.
 */
export const hexToBytes = (str: string): Uint8Array => {
    const hex = str.replace(/^0x/, "").trim();
    if (hex.length % 2 !== 0) {
        throw new Error("Invalid hex string");
    }

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }

    return bytes;
};

/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
export const bytesToHex = (data: Uint8Array): Hex => {
    let hex: Hex = "0x";

    for (let i = 0; i < data.length; i++) {
        hex += data[i].toString(16).padStart(2, "0");
    }

    return hex;
};

