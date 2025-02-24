"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNullBytes = exports.hexToHash = exports.trimHexPrefix = exports.isHex = exports.bytesToHex = exports.hexToBN = exports.hexToBytes = exports.encodeToString = exports.toQuantity = exports.numToHex = exports.ensureHexPrefix = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("./errors");
/**
 * Ensures that a given string has the '0x' prefix.
 * If the string already has the prefix, it is returned as is.
 * Otherwise, the prefix is added to the string.
 *
 * @param {string} hex - The input string.
 * @returns {Hex} The string with the '0x' prefix.
 */
const ensureHexPrefix = (hex) => {
    if (typeof hex !== "string") {
        throw new TypeError("Input must be a string");
    }
    return (hex.startsWith("0x") ? hex : `0x${hex}`);
};
exports.ensureHexPrefix = ensureHexPrefix;
/**
 * Converts a number, bigint, or BN instance to a hexadecimal string representation.
 * If the input value is not already a BN instance, it is converted to one.
 * Throws an error if the input value is a negative number.
 *
 * @param {NumberLike} value - The value to convert to a hexadecimal string.
 * @returns {string} - The hexadecimal string representation of the value.
 * @throws {Error} If the input value is a negative number.
 */
const numToHex = (value) => {
    if (!bn_js_1.default.isBN(value)) {
        value = new bn_js_1.default(value);
    }
    if (value.lt(new bn_js_1.default(0))) {
        throw new Error("Input must be a positive BN value");
    }
    const bigNum = new bn_js_1.default(value.toString()); // Convert bigint to bn.js BN instance
    return (0, exports.ensureHexPrefix)(bigNum.toString("hex"));
};
exports.numToHex = numToHex;
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
const toQuantity = (value) => (0, exports.numToHex)(value);
exports.toQuantity = toQuantity;
/**
 * @deprecated Use `bytesToHex` instead.
 *
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {Hex} The hexadecimal string representation of the Uint8Array.
 */
const encodeToString = (data) => {
    return (0, exports.bytesToHex)(data);
};
exports.encodeToString = encodeToString;
/**
 * Converts a hexadecimal string to a Uint8Array.
 *
 * @param {string} str - The hexadecimal string to convert to a Uint8Array.
 * @returns {Uint8Array} - The Uint8Array representation of the hexadecimal string.
 * @throws {Error} If the input string is not a valid hexadecimal string.
 */
const hexToBytes = (str) => {
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
exports.hexToBytes = hexToBytes;
/**
 * Converts a hexadecimal string to a bigint or number.
 * If the resulting value is too large to fit in a number, it is returned as a BigInt.
 * Otherwise, it is returned as a number.
 *
 * @param {string} hex - The hexadecimal string to convert.
 * @returns {bigint | number} The resulting value as a bigint or number.
 */
const hexToBN = (hex) => {
    let value;
    hex = hex.trim();
    // Check if the hex string starts with "0x"
    if (hex.startsWith("0x")) {
        // If it does, create a BN instance from the hex string without the "0x" prefix
        hex = hex.slice(2);
    }
    value = new bn_js_1.default(hex, 16);
    // Check if the number is too large to fit in a number
    if (value.bitLength() > 53) {
        // If so, return it as a BigInt
        return BigInt(`0x${value.toString(16)}`);
    }
    // Otherwise, return it as a number
    return value.toNumber();
};
exports.hexToBN = hexToBN;
/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to convert to a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
const bytesToHex = (data) => {
    let hex = "0x";
    for (let i = 0; i < data.length; i++) {
        hex += data[i].toString(16).padStart(2, "0");
    }
    return hex;
};
exports.bytesToHex = bytesToHex;
/**
 * Checks if a given value is a hexadecimal string.
 * Optionally, the length of the hexadecimal string can be specified.
 *
 * @param {unknown} value - The value to check.
 * @param {number} byteLength - The length of the in terms of bytes l.
 * @returns {boolean} True if the value is a hexadecimal string, false otherwise.
 */
const isHex = (value, byteLength) => {
    if (typeof value !== "string" || value === "0x") {
        return false;
    }
    let rgx = /^0x[0-9a-fA-F]*$/;
    if (byteLength != null) {
        if (byteLength <= 0) {
            errors_1.ErrorUtils.throwArgumentError("Invalid length, must be a non zero positive number", "length", byteLength);
        }
        rgx = new RegExp(`^0x[0-9a-fA-F]{${byteLength * 2}}$`);
    }
    return rgx.test(value);
};
exports.isHex = isHex;
/**
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} data - The input string.
 * @returns {string} The trimmed hexadecimal string.
 */
const trimHexPrefix = (data) => {
    return (0, exports.isHex)(data) ? data.slice(2) : data;
};
exports.trimHexPrefix = trimHexPrefix;
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
const hexToHash = (hex) => {
    const hash = (0, blake2b_1.blake2b)(hex, { dkLen: 32 });
    return (0, exports.bytesToHex)(hash);
};
exports.hexToHash = hexToHash;
/**
 * Checks if the given Uint8Array consists entirely of null bytes (0x00).
 *
 * @param bytes - The Uint8Array to check.
 * @returns `true` if all bytes are null (0x00), otherwise `false`.
 */
const isNullBytes = (bytes) => {
    return bytes.every((byte) => byte === 0);
};
exports.isNullBytes = isNullBytes;
//# sourceMappingURL=hex.js.map