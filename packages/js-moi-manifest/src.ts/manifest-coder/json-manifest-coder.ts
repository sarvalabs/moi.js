import { ErrorCode, ErrorUtils, hexToBytes, type LogicElement, type LogicManifest } from "js-moi-utils";
import { Depolorizer, Polorizer, WireType } from "js-polo";
import { Schema } from "../schema";
import { BaseManifestCoder } from "./base-manifest-coder";

type SchemaConfig = Record<string, { wireType: WireType; schema: any }>;

export class JsonManifestCoder extends BaseManifestCoder {
    private static MANIFEST_SCHEMA = {
        kind: "struct",
        fields: {
            syntax: {
                kind: "integer",
            },
            engine: Schema.PISA_ENGINE_SCHEMA,
            elements: {
                kind: "array",
                fields: {
                    values: {
                        kind: "struct",
                        fields: {
                            ptr: {
                                kind: "integer",
                            },
                            deps: Schema.PISA_DEPS_SCHEMA,
                            kind: {
                                kind: "string",
                            },
                            data: {
                                kind: "raw",
                            },
                        },
                    },
                },
            },
        },
    };

    private static readonly SCHEMA_CONFIG: SchemaConfig = {
        constant: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_CONSTANT_SCHEMA,
        },
        typedef: {
            wireType: WireType.WIRE_WORD,
            schema: Schema.PISA_TYPEDEF_SCHEMA,
        },
        state: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_STATE_SCHEMA,
        },
        routine: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_ROUTINE_SCHEMA,
        },
        method: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_METHOD_SCHEMA,
        },
        class: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_CLASS_SCHEMA,
        },
        event: {
            wireType: WireType.WIRE_PACK,
            schema: Schema.PISA_EVENT_SCHEMA,
        },
    };

    /**
     * Serializes a given LogicManifest.Element into a Polorizer instance.
     *
     * @param element - The LogicManifest.Element to be serialized.
     * @returns A Polorizer instance containing the serialized data.
     *
     * @throws Will throw an error if the element kind is unknown.
     */
    private serializeElement(element: LogicElement): Polorizer {
        const polorizer = new Polorizer();

        polorizer.polorizeInteger(element.ptr);
        polorizer.polorize(element.deps ?? null, Schema.PISA_DEPS_SCHEMA);
        polorizer.polorizeString(element.kind);

        const config = JsonManifestCoder.SCHEMA_CONFIG[element.kind];

        if (config == null) {
            ErrorUtils.throwError(`Unknown element kind: ${element.kind}`, ErrorCode.UNEXPECTED_ARGUMENT);
        }

        polorizer.polorize(element.data, config.schema);
        return polorizer;
    }

    private deserializeElement(element: any) {
        if (element.deps.length == 0) {
            delete element.deps;
        }

        const config = JsonManifestCoder.SCHEMA_CONFIG[element.kind];

        if (config == null) {
            ErrorUtils.throwError(`Unknown element kind: ${element.kind}`, ErrorCode.UNEXPECTED_ARGUMENT);
        }

        const blob = new Uint8Array([config.wireType, ...element.data]);
        element.data = new Depolorizer(blob).depolorize(config.schema);

        const isRoutineOrMethod = element.kind === "routine" || element.kind === "method";

        if (!isRoutineOrMethod) {
            return element;
        }

        for (const [key, value] of Object.entries(element.data.executes)) {
            if (value === "" || (Array.isArray(value) && value.length === 0)) {
                delete element.data.executes[key];
            }

            if (value instanceof Uint8Array) {
                element.data.executes[key] = Array.from(value);
            }
        }
    }

    /**
     * Serializes an array of elements from the given manifest.
     *
     * @param {LogicManifest.Manifest} manifest - The manifest containing the elements to be serialized.
     * @returns - The polorizer containing the serialized elements.
     */
    private serializeElementArray(manifest: LogicManifest) {
        const polorizer = new Polorizer();

        for (const element of manifest.elements) {
            polorizer.polorizePacked(this.serializeElement(element));
        }

        return polorizer;
    }

    private deserializeElements(elements: LogicElement[]) {
        for (const element of elements) {
            this.deserializeElement(element);
        }
    }

    /**
     * Serializes a given LogicManifest.Manifest object into a POLO Uint8Array.
     *
     * @param {LogicManifest} manifest - The manifest object to be serialized.
     * @returns {Uint8Array} The POLO serialized manifest as a Uint8Array.
     * @throws {Error} If the manifest is invalid.
     */
    encode(manifest: LogicManifest): Uint8Array {
        if (!super.validate(manifest)) {
            ErrorUtils.throwArgumentError("Invalid manifest.", "manifest", manifest);
        }

        const polorizer = new Polorizer();

        polorizer.polorizeInteger(manifest.syntax);
        polorizer.polorize(manifest.engine, Schema.PISA_ENGINE_SCHEMA);

        const elements = this.serializeElementArray(manifest);

        polorizer.polorizePacked(elements);

        return polorizer.bytes();
    }

    private getPoloBytes(data: string | Uint8Array): Uint8Array {
        return typeof data === "string" ? hexToBytes(data) : data;
    }

    decode(data: string | Uint8Array): LogicManifest {
        const depolorizer = new Depolorizer(this.getPoloBytes(data));
        const decoded = depolorizer.depolorize(JsonManifestCoder.MANIFEST_SCHEMA);

        if (!super.validate(decoded)) {
            ErrorUtils.throwArgumentError("Invalid manifest.", "data", data);
        }

        this.deserializeElements(decoded.elements);
        return decoded;
    }
}
