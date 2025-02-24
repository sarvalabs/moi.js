import { bytesToHex, deepCopy, ErrorCode, ErrorUtils, hexToBytes, trimHexPrefix } from "js-moi-utils";
import { Depolorizer, documentEncode } from "js-polo";
import { ElementDescriptor } from "./element-descriptor";
import { JsonManifestCoder } from "./manifest-coder/json-manifest-coder";
import { ManifestCoderFormat } from "./manifest-coder/serialization-format";
import { YamlManifestCoder } from "./manifest-coder/yaml-manifest-coder";
import { Schema } from "./schema";
/**
 * ManifestCoder is a class that provides encoding and decoding functionality
 * for Logic Interface.It allows encoding manifests and arguments, as well as
 * decoding output, exceptions and logic states based on both a predefined and
 * runtime schema.
 *
 * @class
 */
export class ManifestCoder {
    elementDescriptor;
    /**
     * Creates an instance of ManifestCoder.
     */
    constructor(manifest) {
        this.elementDescriptor = new ElementDescriptor(manifest.elements);
    }
    get schema() {
        return new Schema(this.elementDescriptor.getElements(), this.elementDescriptor.getClassDefs());
    }
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
    parseCalldata(schema, arg, updateType = true) {
        const parsableKinds = ["bytes", "array", "map", "struct"];
        const reconstructSchema = (schema) => {
            for (const key in schema.fields ?? {}) {
                if (schema.fields?.[key].kind === "struct") {
                    schema.fields[key].kind = "document";
                }
            }
            return schema;
        };
        const parseArray = (schema, arg) => {
            return arg.map((value, index) => this.parseCalldata(schema, value, arg.length - 1 === index));
        };
        const parseMap = (schema, arg) => {
            const map = new Map();
            const entries = Array.from(arg.entries());
            // Loop through the entries of the Map
            entries.forEach((entry, index) => {
                const [key, value] = entry;
                if (schema.fields) {
                    map.set(this.parseCalldata(schema.fields.keys, key, entries.length - 1 === index), this.parseCalldata(schema.fields.values, value, entries.length - 1 === index));
                }
            });
            return map;
        };
        const parseStruct = (schema, arg, updateType) => {
            Object.keys(arg).forEach((key) => {
                if (schema.fields?.[key] == null) {
                    return;
                }
                arg[key] = this.parseCalldata(schema.fields[key], arg[key], false);
            });
            const doc = documentEncode(arg, reconstructSchema(deepCopy(schema)));
            if (updateType) {
                schema.kind = "document";
                delete schema.fields;
            }
            return doc.getData();
        };
        switch (schema.kind) {
            case "string":
                return trimHexPrefix(arg);
            case "bytes":
                if (typeof arg === "string") {
                    return hexToBytes(arg);
                }
                break;
            case "array":
                if (parsableKinds.includes(schema.fields?.values.kind)) {
                    return parseArray(schema.fields?.values, arg);
                }
                break;
            case "map":
                if (parsableKinds.includes(schema.fields?.keys.kind) || parsableKinds.includes(schema.fields?.values.kind)) {
                    return parseMap(schema, arg);
                }
                break;
            case "struct":
                return parseStruct(schema, arg, updateType);
            default:
                break;
        }
        return arg;
    }
    /**
     * Encodes the arguments for a specified routine into a hexadecimal string.
     *
     * @param routine - The name of the routine for which the arguments are being encoded.
     * @param args - The arguments to be encoded, passed as a variadic parameter.
     * @returns A hexadecimal string representing the encoded arguments.
     */
    encodeArguments(routine, ...args) {
        const element = this.elementDescriptor.getRoutineElement(routine).data;
        const schema = this.schema.parseFields(element.accepts ?? []);
        const calldata = Object.values(element.accepts).reduce((acc, field) => {
            if (schema.fields) {
                acc[field.label] = this.parseCalldata(schema.fields[field.label], args[field.slot]);
            }
            return acc;
        }, {});
        return bytesToHex(documentEncode(calldata, schema).bytes());
    }
    /**
     * Decodes the provided calldata into the expected arguments for a given routine.
     *
     * @template T - The type of the decoded arguments.
     * @param {string} routine - The name of the routine whose arguments are to be decoded.
     * @param {string} calldata - The calldata to decode.
     * @returns {T | null} - The decoded arguments as an object of type T, or null if the routine accepts no arguments.
     */
    decodeArguments(routine, calldata) {
        const element = this.elementDescriptor.getRoutineElement(routine).data;
        if (element && element.accepts.length === 0) {
            return null;
        }
        const schema = this.schema.parseFields(element.accepts ?? []);
        const decodedCalldata = new Depolorizer(hexToBytes(calldata)).depolorize(schema);
        return element.accepts.map((field) => decodedCalldata[field.label]);
    }
    /**
     * Decodes the output of a routine.
     *
     * @template T - The type to which the output should be decoded.
     * @param {string} routine - The name of the routine whose output is to be decoded.
     * @param {string} output - The output string to decode.
     * @returns {T | null} - The decoded output as type T, or null if the output is invalid or the routine has no return schema.
     */
    decodeOutput(routine, output) {
        const element = this.elementDescriptor.getRoutineElement(routine).data;
        if (output && output != "0x" && element.returns && element.returns.length) {
            const schema = this.schema.parseFields(element.returns);
            return new Depolorizer(hexToBytes(output)).depolorize(schema);
        }
        return null;
    }
    /**
     * Decodes a log data from an event emitted in a logic.
     *
     * @param {string} event - The name of the event.
     * @param {string} logData - The POLO encoded log data to be decoded.
     * @returns {T | null} The decoded event log data, or null if the log data is empty.
     */
    decodeEventOutput(event, logData) {
        if (event === "builtin.Log") {
            return new Depolorizer(hexToBytes(logData)).depolorize(Schema.PISA_BUILT_IN_LOG_SCHEMA);
        }
        const element = this.elementDescriptor.getEventElement(event);
        if (element == null) {
            throw new Error(`Event ${event} not found in manifest`);
        }
        if (logData && logData !== "0x") {
            const element = this.elementDescriptor.getEventElement(event);
            const schema = this.schema.parseFields(element.data.fields);
            return new Depolorizer(hexToBytes(logData)).depolorize(schema);
        }
        return null;
    }
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
    static decodeException(error) {
        if (error && error !== "0x") {
            const decodedError = hexToBytes(error);
            const depolorizer = new Depolorizer(decodedError);
            return depolorizer.depolorize(Schema.PISA_EXCEPTION_SCHEMA);
        }
        return null;
    }
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
    static encodeManifest(manifest) {
        if (typeof manifest === "object" && manifest !== null) {
            const serializer = new JsonManifestCoder();
            return bytesToHex(serializer.encode(manifest));
        }
        if (typeof manifest === "string") {
            const serializer = new YamlManifestCoder();
            return bytesToHex(serializer.encode(manifest));
        }
        ErrorUtils.throwError("Unsupported manifest type", ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * Decodes a given manifest in either JSON or YAML format.
     *
     * @param {string | Uint8Array} manifest - The manifest data to decode, provided as a string or Uint8Array.
     * @param {ManifestCoderFormat} format - The format of the manifest, either JSON or YAML.
     *
     * @returns {LogicManifest.Manifest | string} - Returns a `LogicManifest.Manifest` object if JSON format is used or a string representation if YAML format is used.
     *
     * @throws {Error} - Throws an error if the format is unsupported.
     */
    static decodeManifest(manifest, format) {
        if (format === ManifestCoderFormat.JSON) {
            const serializer = new JsonManifestCoder();
            return serializer.decode(manifest);
        }
        if (format === ManifestCoderFormat.YAML) {
            const serializer = new YamlManifestCoder();
            return serializer.decode(manifest);
        }
        ErrorUtils.throwError("Unsupported manifest format", ErrorCode.UNSUPPORTED_OPERATION);
    }
}
//# sourceMappingURL=manifest-coder.js.map