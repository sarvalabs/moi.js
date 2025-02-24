/**
 * Enum representing error codes.
 */
export declare enum ErrorCode {
    UNKNOWN_ERROR = "ERROR_UNKNOWN",
    NOT_IMPLEMENTED = "ERROR_NOT_IMPLEMENTED",
    UNSUPPORTED_OPERATION = "ERROR_UNSUPPORTED_OPERATION",
    NETWORK_ERROR = "ERROR_NETWORK",
    SERVER_ERROR = "ERROR_SERVER",
    TIMEOUT = "ERROR_TIMEOUT",
    BUFFER_OVERRUN = "ERROR_BUFFER_OVERRUN",
    NUMERIC_FAULT = "ERROR_NUMERIC_FAULT",
    MISSING_NEW = "ERROR_MISSING_NEW",
    INVALID_ARGUMENT = "ERROR_INVALID_ARGUMENT",
    MISSING_ARGUMENT = "ERROR_MISSING_ARGUMENT",
    UNEXPECTED_ARGUMENT = "ERROR_UNEXPECTED_ARGUMENT",
    NOT_INITIALIZED = "ERROR_NOT_INITIALIZED",
    PROPERTY_NOT_DEFINED = "ERROR_PROPERTY_NOT_DEFINED",
    CALL_EXCEPTION = "ERROR_CALL_EXCEPTION",
    INSUFFICIENT_FUNDS = "ERROR_INSUFFICIENT_FUNDS",
    SEQUENCE_EXPIRED = "ERROR_NONCE_EXPIRED",
    INTERACTION_UNDERPRICED = "ERROR_INTERACTION_UNDERPRICED",
    UNPREDICTABLE_FUEL_LIMIT = "ERROR_UNPREDICTABLE_FUEL_LIMIT",
    ACTION_REJECTED = "ERROR_ACTION_REJECTED",
    INVALID_SIGNATURE = "ERROR_INVALID_SIGNATURE",
    NOT_FOUND = "ERROR_NOT_FOUND"
}
/**
 * Interface representing error parameters.
 */
interface ErrorParams {
    [name: string]: any;
}
/**
 * CustomError class that extends the Error class.
 */
export declare class CustomError extends Error {
    code: ErrorCode | string | number;
    reason: string;
    params: ErrorParams;
    constructor(message: string, code?: ErrorCode | string | number, params?: ErrorParams);
    /**
     * Overrides the toString() method to provide a string representation of the error.
     *
     * @returns {string} - The string representation of the error.
     */
    toString(): string;
}
/**
 * ErrorUtils class with static helper methods for handling errors.
 */
export declare class ErrorUtils {
    /**
     * Throws a CustomError with the specified message, error code, and parameters.
     *
     * @param {string} message - The error message.
     * @param {ErrorCode} code - The error code.
     * @param {ErrorParams} params - The parameters of the error.
     * @throws {CustomError} - Throws a CustomError.
     */
    static throwError(message: string, code?: ErrorCode | string | number, params?: ErrorParams): never;
    /**
     * Throws a CustomError with the specified argument-related error message,
     * argument name, and value.
     *
     * @param {string} message - The error message.
     * @param {string} name - The name of the argument.
     * @param {any} value - The value of the argument.
     * @throws {CustomError} - Throws a CustomError.
     */
    static throwArgumentError(message: string, name: string, value: any): never;
}
export {};
//# sourceMappingURL=errors.d.ts.map