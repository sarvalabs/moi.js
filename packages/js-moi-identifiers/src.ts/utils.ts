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

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const encodeBase58 = (uint8Array: Uint8Array): string => {
    if (uint8Array.length === 0) {
        return "";
    }

    // Count leading zeros
    let zeros = 0;
    while (zeros < uint8Array.length && uint8Array[zeros] === 0) {
        ++zeros;
    }

    // Convert to Base58
    let result: number[] = [];
    for (let i = zeros; i < uint8Array.length; i++) {
        let carry = uint8Array[i];
        for (let j = 0; j < result.length; j++) {
            carry += result[j] << 8;
            result[j] = carry % 58;
            carry = (carry / 58) | 0;
        }

        while (carry > 0) {
            result.push(carry % 58);
            carry = (carry / 58) | 0;
        }
    }

    // Add leading zeros
    for (let i = zeros; i > 0; --i) {
        result.push(0);
    }

    // Convert to string
    return result
        .reverse()
        .map((digit) => ALPHABET[digit])
        .join("");
};

const BASE = 58;

export const decodeBase58 = (base58String: string): Uint8Array => {
    if (base58String.length === 0) {
        return new Uint8Array([]);
    }

    // Convert the string to an array of numbers
    let result: number[] = [0];
    for (let i = 0; i < base58String.length; i++) {
        let carry = ALPHABET.indexOf(base58String[i]);
        if (carry === -1) {
            throw new Error("Invalid Base58 character");
        }

        for (let j = 0; j < result.length; j++) {
            carry += result[j] * BASE;
            result[j] = carry & 0xff;
            carry >>= 8;
        }

        while (carry > 0) {
            result.push(carry & 0xff);
            carry >>= 8;
        }
    }

    // Count leading zeros
    let zeros = 0;
    while (zeros < base58String.length && base58String[zeros] === "1") {
        ++zeros;
    }

    // Add leading zeros
    let decoded = new Uint8Array(zeros + result.length);
    for (let i = 0; i < result.length; i++) {
        decoded[zeros + i] = result[result.length - 1 - i];
    }

    return decoded;
};
