/**
 * Enum representing error codes.
 */
export enum ErrorCode {
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
    NOT_FOUND = "ERROR_NOT_FOUND",
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
export class CustomError extends Error {
    public code: ErrorCode | string | number;
    public reason: string;
    public params: ErrorParams;

    constructor(message: string, code: ErrorCode | string | number = ErrorCode.UNKNOWN_ERROR, params: ErrorParams = {}) {
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
    public override toString(): string {
        const messageDetails = Object.entries(this.params)
            .map(([key, value]) => `${key}=${serializeValue(value)}`)
            .join(", ");

        const errorMessageStack = messageDetails ? ` (${messageDetails})` : "";

        return `${this.reason}${errorMessageStack}`;
    }
}

/**
 * ErrorUtils class with static helper methods for handling errors.
 */
export class ErrorUtils {
    /**
     * Throws a CustomError with the specified message, error code, and parameters.
     *
     * @param {string} message - The error message.
     * @param {ErrorCode} code - The error code.
     * @param {ErrorParams} params - The parameters of the error.
     * @throws {CustomError} - Throws a CustomError.
     */
    public static throwError(message: string, code?: ErrorCode | string | number, params: ErrorParams = {}): never {
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
    public static throwArgumentError(message: string, name: string, value: any): never {
        ErrorUtils.throwError(message, ErrorCode.INVALID_ARGUMENT, {
            argument: name,
            value: serializeValue(value),
        });
    }
}

// helper functions

/**
 * Serializes a value into a string representation.
 * If the value can be successfully converted to a JSON string, it is returned.
 * Otherwise, the value is converted to a string using the `String` function.
 *
 * @param {any} value - The value to serialize.
 * @returns {string} - The serialized string representation of the value.
 */
const serializeValue = (value: any): string => {
    try {
        return JSON.stringify(value);
    } catch (error) {
        return String(value);
    }
};
