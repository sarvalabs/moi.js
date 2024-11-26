"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trimHexPrefix = exports.isHex = exports.bytesToHex = exports.hexToBN = exports.hexToBytes = exports.encodeToString = exports.toQuantity = exports.numToHex = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const buffer_1 = require("buffer");
const errors_1 = require("./errors");
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
        throw new Error('Input must be a positive BN value');
    }
    const bigNum = new bn_js_1.default(value.toString()); // Convert bigint to bn.js BN instance
    return bigNum.toString(16).toUpperCase();
};
exports.numToHex = numToHex;
/**
 * Converts a number, bigint, or BN instance to a quantity string representation.
 * The quantity string is prefixed with "0x" and is obtained by calling `numToHex` function.
 *
 * @param {NumberLike} value - The value to convert to a quantity string.
 * @returns {string} - The quantity string representation of the value.
 * @throws {Error} If an error occurs during the conversion.
 */
const toQuantity = (value) => {
    try {
        return "0x" + (0, exports.numToHex)(value);
    }
    catch (err) {
        throw err;
    }
};
exports.toQuantity = toQuantity;
/**
 * Converts a Uint8Array to a hexadecimal string representation.
 *
 * @param {Uint8Array} data - The Uint8Array to encode as a hexadecimal string.
 * @returns {string} The hexadecimal string representation of the Uint8Array.
 */
const encodeToString = (data) => {
    return "0x" + buffer_1.Buffer.from(data).toString('hex');
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
    const hex = str.replace(/^0x/, '').trim();
    if (hex.length % 2 !== 0) {
        throw new Error('Invalid hex string');
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
    return buffer_1.Buffer.from(data).toString('hex');
};
exports.bytesToHex = bytesToHex;
/**
 * Checks if a given string is a valid hexadecimal value.
 *
 * @param {string} value - The input string.
 * @returns {boolean} True if the input is a valid hexadecimal string, false otherwise.
 */
const isHex = (value) => {
    return typeof value === "string" && /^(0x)?[0-9A-Fa-f]+$/g.test(value);
};
exports.isHex = isHex;
/**
 * Removes the '0x' prefix from a hexadecimal string if present.
 *
 * @param {string} data - The input string.
 * @returns {string} The trimmed hexadecimal string.
 */
const trimHexPrefix = (data) => {
    if (typeof data !== 'string') {
        errors_1.ErrorUtils.throwArgumentError("Input must be a string", "data", data);
    }
    if ((0, exports.isHex)(data) && data.startsWith('0x')) {
        data = data.slice(2);
    }
    return data;
};
exports.trimHexPrefix = trimHexPrefix;
//# sourceMappingURL=hex.js.map