/**
 * Encodes a Uint8Array into a base64 string.
 *
 * @param {Uint8Array} uint8Array - The Uint8Array to encode.
 * @returns {string} The base64 encoded string.
 */
export const encodeBase64 = (uint8Array: Uint8Array): string => {
    let binaryString = "";
    for (let i = 0; i < uint8Array.length; i++) {
        binaryString += String.fromCharCode(uint8Array[i]);
    }

    return btoa(binaryString);
};

/**
 * Decodes a base64 string into a Uint8Array.
 *
 * @param {string} base64String - The base64 string to decode.
 * @returns {Uint8Array} The decoded Uint8Array.
 */
export const decodeBase64 = (base64String: string): Uint8Array => {
    const binaryString = atob(base64String);
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
    }

    return uint8Array;
};
