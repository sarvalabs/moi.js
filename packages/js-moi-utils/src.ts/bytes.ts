export type Bytes = ArrayLike<number>;

/**
 * Checks if the given value is an integer.
 *
 * @param value - The value to check.
 * @returns Returns true if the value is an integer, otherwise false.
 */
export const isInteger = (value: number) => {
    return typeof value === "number" && value === value && value % 1 === 0;
};

/**
 * Checks if the given value is a valid byte array.
 *
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a valid byte array, otherwise false.
 */
export const isBytes = (value: any): value is Bytes => {
    if (value == null) {
        return false;
    }

    if (value.constructor === Uint8Array) {
        return true;
    }

    if (typeof value === "string") {
        return false;
    }

    if (!isInteger(value.length) || value.length < 0) {
        return false;
    }

    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (!isInteger(v) || v < 0 || v >= 256) {
            return false;
        }
    }
    return true;
};

/**
 * Calculates the length of the data represented by a hexadecimal string.
 *
 * @param {string} data - The hexadecimal string.
 * @returns {number | null} - The length of the data, or null if the input is
 * not a valid hexadecimal string.
 */
export const hexDataLength = (data: string) => {
    // Check if the input is a valid hexadecimal string and has an even length
    if (!isHexString(data) || data.length % 2) {
        return null;
    }

    // Calculate the length of the data excluding the "0x" prefix
    return (data.length - 2) / 2;
};

/**
 * Checks if the given value is a valid hexadecimal string.
 *
 * @param {any} value - The value to check.
 * @param {number} length - Optional. The expected length of the hexadecimal string.
 * @returns {boolean} Returns true if the value is a valid hexadecimal string, otherwise false.
 */
export const isHexString = (value: any, length?: number): boolean => {
    if (typeof value !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
};

/**
 * Generates a Uint8Array of the specified size filled with cryptographically secure random bytes.
 *
 * @param size - The number of random bytes to generate.
 * @returns A Uint8Array containing the generated random bytes.
 */
export const randomBytes = (size: number): Uint8Array => {
    return globalThis.crypto.getRandomValues(new Uint8Array(size));
};

/**
 * Encodes a given text string into a Uint8Array using the TextEncoder API.
 *
 * @param text - The text string to be encoded.
 * @returns A Uint8Array containing the encoded text.
 */
export const encodeText = (text: string) => {
    return new TextEncoder().encode(text);
};

/**
 * Decodes a Uint8Array into a string using the TextDecoder API.
 *
 * @param data - The Uint8Array to decode.
 * @returns The decoded string.
 */
export const decodeText = (data: Uint8Array) => {
    return new TextDecoder().decode(data);
};

/**
 * Concatenates multiple Uint8Array instances into a single Uint8Array.
 *
 * @param {...Uint8Array[]} arrays - The arrays to concatenate.
 * @returns {Uint8Array} A new Uint8Array containing the concatenated values.
 */
export const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);

    let offset = 0;

    for (let i = 0; i < arrays.length; i++) {
        result.set(arrays[i], offset);

        offset += arrays[i].length;
    }

    return result;
};
