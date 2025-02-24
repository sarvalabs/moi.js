"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorUtils = exports.CustomError = exports.ErrorCode = void 0;
/**
 * Enum representing error codes.
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["UNKNOWN_ERROR"] = "ERROR_UNKNOWN";
    ErrorCode["NOT_IMPLEMENTED"] = "ERROR_NOT_IMPLEMENTED";
    ErrorCode["UNSUPPORTED_OPERATION"] = "ERROR_UNSUPPORTED_OPERATION";
    ErrorCode["NETWORK_ERROR"] = "ERROR_NETWORK";
    ErrorCode["SERVER_ERROR"] = "ERROR_SERVER";
    ErrorCode["TIMEOUT"] = "ERROR_TIMEOUT";
    ErrorCode["BUFFER_OVERRUN"] = "ERROR_BUFFER_OVERRUN";
    ErrorCode["NUMERIC_FAULT"] = "ERROR_NUMERIC_FAULT";
    ErrorCode["MISSING_NEW"] = "ERROR_MISSING_NEW";
    ErrorCode["INVALID_ARGUMENT"] = "ERROR_INVALID_ARGUMENT";
    ErrorCode["MISSING_ARGUMENT"] = "ERROR_MISSING_ARGUMENT";
    ErrorCode["UNEXPECTED_ARGUMENT"] = "ERROR_UNEXPECTED_ARGUMENT";
    ErrorCode["NOT_INITIALIZED"] = "ERROR_NOT_INITIALIZED";
    ErrorCode["PROPERTY_NOT_DEFINED"] = "ERROR_PROPERTY_NOT_DEFINED";
    ErrorCode["CALL_EXCEPTION"] = "ERROR_CALL_EXCEPTION";
    ErrorCode["INSUFFICIENT_FUNDS"] = "ERROR_INSUFFICIENT_FUNDS";
    ErrorCode["SEQUENCE_EXPIRED"] = "ERROR_NONCE_EXPIRED";
    ErrorCode["INTERACTION_UNDERPRICED"] = "ERROR_INTERACTION_UNDERPRICED";
    ErrorCode["UNPREDICTABLE_FUEL_LIMIT"] = "ERROR_UNPREDICTABLE_FUEL_LIMIT";
    ErrorCode["ACTION_REJECTED"] = "ERROR_ACTION_REJECTED";
    ErrorCode["INVALID_SIGNATURE"] = "ERROR_INVALID_SIGNATURE";
    ErrorCode["NOT_FOUND"] = "ERROR_NOT_FOUND";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
/**
 * CustomError class that extends the Error class.
 */
class CustomError extends Error {
    code;
    reason;
    params;
    constructor(message, code = ErrorCode.UNKNOWN_ERROR, params = {}) {
        super(message);
        this.code = code;
        this.reason = message;
        this.params = params;
        Object.setPrototypeOf(this, CustomError.prototype);
    }
    /**
     * Overrides the toString() method to provide a string representation of the error.
     *
     * @returns {string} - The string representation of the error.
     */
    toString() {
        const messageDetails = Object.entries(this.params)
            .map(([key, value]) => `${key}=${serializeValue(value)}`)
            .join(", ");
        const errorMessageStack = messageDetails ? ` (${messageDetails})` : "";
        return `${this.reason}${errorMessageStack}`;
    }
}
exports.CustomError = CustomError;
/**
 * ErrorUtils class with static helper methods for handling errors.
 */
class ErrorUtils {
    /**
     * Throws a CustomError with the specified message, error code, and parameters.
     *
     * @param {string} message - The error message.
     * @param {ErrorCode} code - The error code.
     * @param {ErrorParams} params - The parameters of the error.
     * @throws {CustomError} - Throws a CustomError.
     */
    static throwError(message, code, params = {}) {
        const error = new CustomError(message, code, params);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(error, ErrorUtils.throwError);
        }
        throw error;
    }
    /**
     * Throws a CustomError with the specified argument-related error message,
     * argument name, and value.
     *
     * @param {string} message - The error message.
     * @param {string} name - The name of the argument.
     * @param {any} value - The value of the argument.
     * @throws {CustomError} - Throws a CustomError.
     */
    static throwArgumentError(message, name, value) {
        ErrorUtils.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: serializeValue(value),
        });
    }
}
exports.ErrorUtils = ErrorUtils;
// helper functions
/**
 * Serializes a value into a string representation.
 * If the value can be successfully converted to a JSON string, it is returned.
 * Otherwise, the value is converted to a string using the `String` function.
 *
 * @param {any} value - The value to serialize.
 * @returns {string} - The serialized string representation of the value.
 */
const serializeValue = (value) => {
    try {
        return JSON.stringify(value);
    }
    catch (error) {
        return String(value);
    }
};
//# sourceMappingURL=errors.js.map