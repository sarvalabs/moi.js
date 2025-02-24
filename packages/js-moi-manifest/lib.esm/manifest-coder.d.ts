import { type Hex, type LogicManifest } from "js-moi-utils";
import { ManifestCoderFormat } from "./manifest-coder/serialization-format";
import type { Exception } from "./types/exception";
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface.It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export declare class ManifestCoder {
    private readonly elementDescriptor;
    /**
     * Creates an instance of ManifestCoder.
     *
     * @param {LogicManifest.Manifest} manifest - The logic manifest.
     * @constructor
     */
    constructor(manifest: LogicManifest);
    private get schema();
    /**
     * Parses the calldata arguments based on the provided POLO Schema.
     * The calldata arguments is recursively processed and transformed according to the schema.
     *
     * @private
     * @param {PoloSchema} schema - The schema definition for the calldata.
     * @param {*} arg - The calldata argument to parse.
     * @param {boolean} [updateType=true] - Indicates whether to update the schema type during parsing.
     * @returns {*} The parsed calldata argument.
     */
    private parseCalldata;
    /**
     * Encodes the arguments for a specified routine into a hexadecimal string.
     *
     * @param routine - The name of the routine for which the arguments are being encoded.
     * @param args - The arguments to be encoded, passed as a variadic parameter.
     * @returns A hexadecimal string representing the encoded arguments.
     */
    encodeArguments(routine: string, ...args: any[]): Hex;
    /**
     * Decodes the provided calldata into the expected arguments for a given routine.
     *
     * @template T - The type of the decoded arguments.
     * @param {string} routine - The name of the routine whose arguments are to be decoded.
     * @param {string} calldata - The calldata to decode.
     * @returns {T | null} - The decoded arguments as an object of type T, or null if the routine accepts no arguments.
     */
    decodeArguments<T>(routine: string, calldata: string): T | null;
    /**
     * Decodes the output of a routine.
     *
     * @template T - The type to which the output should be decoded.
     * @param {string} routine - The name of the routine whose output is to be decoded.
     * @param {string} output - The output string to decode.
     * @returns {T | null} - The decoded output as type T, or null if the output is invalid or the routine has no return schema.
     */
    decodeOutput<T>(routine: string, output: string): T | null;
    /**
     * Decodes a log data from an event emitted in a logic.
     *
     * @param {string} event - The name of the event.
     * @param {string} logData - The log data to decode, represented as a hexadecimal string prefixed with "0x".
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    decodeEventOutput<T>(event: string, logData: string): T | null;
    /**
     * Decodes a log data from an event emitted in a logic.
     *
     * @param {string} logData - The log data to decode, represented as a hexadecimal string prefixed with "0x".
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    decodeEventOutput(event: "builtin.Log", logData: string): {
        value: string;
    } | null;
    /**
     * Decodes an exception thrown by a logic routine call.
     * The exception data is decoded using the predefined exception schema.
     * Returns the decoded exception object, or null if the error is empty.
     *
     * @param {string} error - The error data to decode, represented as a
     hexadecimal string prefixed with "0x".
     * @returns {Exception | null} The decoded exception object, or null if
     the error is empty.
     */
    static decodeException(error: string): Exception | null;
    /**
     * Encodes a manifest into a hexadecimal string.
     *
     * This function supports encoding both JSON and YAML manifest formats.
     * If the input manifest is an object, it is assumed to be a JSON manifest and
     * is encoded using the `JsonManifestCoder`. If the input manifest is a string,
     * it is assumed to be a YAML manifest and is encoded using the `YamlManifestCoder`.
     *
     * @param manifest - The manifest to encode. It can be either a string (YAML) or an object (JSON).
     * @returns The encoded manifest as a hexadecimal string prefixed with "0x".
     * @throws Will throw an error if the manifest type is unsupported.
     */
    static encodeManifest(manifest: string | LogicManifest): Hex;
    /**
     * Decodes a given manifest in either JSON format.
     *
     * @param manifest - The manifest data to decode, provided as a string or Uint8Array.
     * @param format - The format of the manifest in JSON string.
     *
     * @returns Returns a JSON manifest object.
     *
     * @throws Throws an error if the format is unsupported.
     */
    static decodeManifest(manifest: string | Uint8Array, format: ManifestCoderFormat.JSON): LogicManifest;
    /**
     * Decodes a given manifest in either YAML format.
     *
     * @param {string | Uint8Array} manifest The manifest data to decode, provided as a string or Uint8Array.
     * @param {ManifestCoderFormat} format The format of the manifest in YAML string.
     *
     * @returns {string} Returns a YAML string representation.
     *
     * @throws {Error} Throws an error if the format is unsupported.
     */
    static decodeManifest(manifest: string | Uint8Array, format: ManifestCoderFormat.YAML): string;
}
//# sourceMappingURL=manifest-coder.d.ts.map