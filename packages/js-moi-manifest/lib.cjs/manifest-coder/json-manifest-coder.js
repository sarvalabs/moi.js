"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonManifestCoder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const schema_1 = require("../schema");
const base_manifest_coder_1 = require("./base-manifest-coder");
class JsonManifestCoder extends base_manifest_coder_1.BaseManifestCoder {
    static MANIFEST_SCHEMA = {
        kind: "struct",
        fields: {
            syntax: {
                kind: "integer",
            },
            engine: schema_1.Schema.PISA_ENGINE_SCHEMA,
            elements: {
                kind: "array",
                fields: {
                    values: {
                        kind: "struct",
                        fields: {
                            ptr: {
                                kind: "integer",
                            },
                            deps: schema_1.Schema.PISA_DEPS_SCHEMA,
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
    static SCHEMA_CONFIG = {
        constant: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_CONSTANT_SCHEMA,
        },
        typedef: {
            wireType: js_polo_1.WireType.WIRE_WORD,
            schema: schema_1.Schema.PISA_TYPEDEF_SCHEMA,
        },
        state: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_STATE_SCHEMA,
        },
        routine: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_ROUTINE_SCHEMA,
        },
        method: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_METHOD_SCHEMA,
        },
        class: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_CLASS_SCHEMA,
        },
        event: {
            wireType: js_polo_1.WireType.WIRE_PACK,
            schema: schema_1.Schema.PISA_EVENT_SCHEMA,
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
    serializeElement(element) {
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeInteger(element.ptr);
        polorizer.polorize(element.deps ?? null, schema_1.Schema.PISA_DEPS_SCHEMA);
        polorizer.polorizeString(element.kind);
        const config = JsonManifestCoder.SCHEMA_CONFIG[element.kind];
        if (config == null) {
            js_moi_utils_1.ErrorUtils.throwError(`Unknown element kind: ${element.kind}`, js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        polorizer.polorize(element.data, config.schema);
        return polorizer;
    }
    deserializeElement(element) {
        if (element.deps.length == 0) {
            delete element.deps;
        }
        const config = JsonManifestCoder.SCHEMA_CONFIG[element.kind];
        if (config == null) {
            js_moi_utils_1.ErrorUtils.throwError(`Unknown element kind: ${element.kind}`, js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        const blob = new Uint8Array([config.wireType, ...element.data]);
        element.data = new js_polo_1.Depolorizer(blob).depolorize(config.schema);
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
    serializeElementArray(manifest) {
        const polorizer = new js_polo_1.Polorizer();
        for (const element of manifest.elements) {
            polorizer.polorizePacked(this.serializeElement(element));
        }
        return polorizer;
    }
    deserializeElements(elements) {
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
    encode(manifest) {
        if (!super.validate(manifest)) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid manifest.", "manifest", manifest);
        }
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorizeInteger(manifest.syntax);
        polorizer.polorize(manifest.engine, schema_1.Schema.PISA_ENGINE_SCHEMA);
        const elements = this.serializeElementArray(manifest);
        polorizer.polorizePacked(elements);
        return polorizer.bytes();
    }
    getPoloBytes(data) {
        return typeof data === "string" ? (0, js_moi_utils_1.hexToBytes)(data) : data;
    }
    decode(data) {
        const depolorizer = new js_polo_1.Depolorizer(this.getPoloBytes(data));
        const decoded = depolorizer.depolorize(JsonManifestCoder.MANIFEST_SCHEMA);
        if (!super.validate(decoded)) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid manifest.", "data", data);
        }
        this.deserializeElements(decoded.elements);
        return decoded;
    }
}
exports.JsonManifestCoder = JsonManifestCoder;
//# sourceMappingURL=json-manifest-coder.js.map