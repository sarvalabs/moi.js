"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Schema = exports.isClass = exports.isMap = exports.isArray = exports.isPrimitiveType = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ARRAY_MATCHER_REGEX = /^\[(\d*)\]/;
const primitiveTypes = ["null", "bool", "bytes", "address", "string", "u64", "u256", "i64", "i256", "bigint"];
/**
 * Checks if the given type is a primitive type.
 *
 * @param type - The type to check.
 * @returns `true` if the type is a primitive type, otherwise `false`.
 */
const isPrimitiveType = (type) => {
    return primitiveTypes.includes(type);
};
exports.isPrimitiveType = isPrimitiveType;
/**
 * Checks if the given type string matches the array pattern.
 *
 * @param type - The type string to be checked.
 * @returns `true` if the type string matches the array pattern, otherwise `false`.
 */
const isArray = (type) => {
    return ARRAY_MATCHER_REGEX.test(type);
};
exports.isArray = isArray;
/**
 * Checks if the given type string starts with "map".
 *
 * @param type - The type string to check.
 * @returns `true` if the type string starts with "map", otherwise `false`.
 */
const isMap = (type) => {
    return type.startsWith("map");
};
exports.isMap = isMap;
/**
 * Checks if a given type is present in the class definitions map.
 *
 * @param type - The type to check for in the class definitions.
 * @param classDefs - A map containing class definitions where the key is the class type and the value is a number.
 * @returns `true` if the type is present in the class definitions map, otherwise `false`.
 */
const isClass = (type, classDefs) => {
    return classDefs.has(type);
};
exports.isClass = isClass;
/**
 * Schema is a class that provides schema parsing functionality for encoding and
 * decoding manifest, arguments, logic states and other data based on
 * a predefined schema. It supports parsing fields and generating a schema for
 * decoding purposes.
 *
 * @class
 */
class Schema {
    elements;
    classDefs;
    constructor(elements, classDefs) {
        this.elements = elements;
        this.classDefs = classDefs;
    }
    /**
     * Represents the schema for the PISA engine.
     */
    static PISA_ENGINE_SCHEMA = {
        kind: "struct",
        fields: {
            kind: {
                kind: "string",
            },
            flags: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA dependencies.
     */
    static PISA_DEPS_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "integer",
            },
        },
    };
    /**
     * Schema definition for PISA type field.
     */
    static PISA_TYPE_FIELD_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "struct",
                fields: {
                    slot: {
                        kind: "integer",
                    },
                    label: {
                        kind: "string",
                    },
                    type: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for the PISA method field.
     */
    static PISA_METHOD_FIELD_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "struct",
                fields: {
                    ptr: {
                        kind: "integer",
                    },
                    code: {
                        kind: "integer",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA instructions.
     */
    static PISA_INSTRUCTIONS_SCHEMA = {
        kind: "struct",
        fields: {
            bin: {
                kind: "bytes",
            },
            hex: {
                kind: "string",
            },
            asm: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA state.
     */
    static PISA_STATE_SCHEMA = {
        kind: "struct",
        fields: {
            mode: {
                kind: "string",
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
        },
    };
    /**
     * Schema definition for PISA constant.
     */
    static PISA_CONSTANT_SCHEMA = {
        kind: "struct",
        fields: {
            type: {
                kind: "string",
            },
            value: {
                kind: "string",
            },
        },
    };
    /**
     * Schema definition for PISA typedef.
     */
    static PISA_TYPEDEF_SCHEMA = {
        kind: "string",
        fields: {},
    };
    /**
     * Schema definition for PISA class.
     */
    static PISA_CLASS_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string",
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
            methods: {
                ...Schema.PISA_METHOD_FIELD_SCHEMA,
            },
        },
    };
    /**
     * Schema definition for PISA routine.
     */
    static PISA_ROUTINE_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string",
            },
            mode: {
                kind: "string",
            },
            kind: {
                kind: "string",
            },
            accepts: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
            returns: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
            executes: {
                ...Schema.PISA_INSTRUCTIONS_SCHEMA,
            },
            catches: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA method.
     */
    static PISA_METHOD_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string",
            },
            class: {
                kind: "string",
            },
            mutable: {
                kind: "bool",
            },
            accepts: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
            returns: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
            executes: {
                ...Schema.PISA_INSTRUCTIONS_SCHEMA,
            },
            catches: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA event.
     */
    static PISA_EVENT_SCHEMA = {
        kind: "struct",
        fields: {
            name: {
                kind: "string",
            },
            topics: {
                kind: "integer",
            },
            fields: {
                ...Schema.PISA_TYPE_FIELD_SCHEMA,
            },
        },
    };
    /**
     * Schema definition for PISA exception.
     */
    static PISA_EXCEPTION_SCHEMA = {
        kind: "struct",
        fields: {
            class: {
                kind: "string",
            },
            error: {
                kind: "string",
            },
            revert: {
                kind: "bool",
            },
            trace: {
                kind: "array",
                fields: {
                    values: {
                        kind: "string",
                    },
                },
            },
        },
    };
    /**
     * Schema definition for PISA result.
     */
    static PISA_RESULT_SCHEMA = {
        kind: "struct",
        fields: {
            outputs: {
                kind: "bytes",
            },
            error: {
                kind: "bytes",
            },
        },
    };
    /**
     * Schema definition for PISA log.
     */
    static PISA_BUILT_IN_LOG_SCHEMA = {
        kind: "struct",
        fields: {
            value: {
                kind: "string",
            },
        },
    };
    /**
     * Extracts the array data type from the provided data type string.
     *
     * @param {string} dataType - The array data type, eg:"[]u64".
     * @returns {string} The extracted array data type.
     * @throws {Error} If the array type is invalid or unsupported.
     */
    static extractArrayDataType(dataType) {
        if (!(0, exports.isArray)(dataType)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid array type: The provided data type is not an array.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        const type = dataType.replace(ARRAY_MATCHER_REGEX, "");
        if (type === "") {
            js_moi_utils_1.ErrorUtils.throwError("Failed to extract array type: The array type could not be determined.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return type;
    }
    /**
     * Extracts the key and value data types from the provided map data type string.
     *
     * @param {string} dataType - The map data type. eg:"map[u64]string".
     * @returns The extracted key and value data types as a tuple.
     * @throws {Error} If the map data type is invalid or unsupported.
     */
    static extractMapDataType(dataType) {
        let brackets = [];
        let startIndex = 0;
        let endIndex = 0;
        for (let i = 0; i < dataType.length; i++) {
            if (dataType.charAt(i) == "[") {
                if (startIndex === 0) {
                    startIndex = i + 1;
                }
                brackets.push("[");
            }
            else if (dataType.charAt(i) == "]") {
                brackets.pop();
                if (brackets.length === 0) {
                    endIndex = i;
                    break;
                }
            }
        }
        const key = dataType.slice(startIndex, endIndex);
        const value = dataType.replace("map[" + key + "]", "");
        if (!key || !value) {
            js_moi_utils_1.ErrorUtils.throwError("Failed to extract map type: The key or value type of the map could not be determined.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        return [key, value];
    }
    /**
     * Converts the primitive data type to a standardized representation.
     *
     * @param {string} type - The primitive data type.
     * @returns {string} The converted data type.
     * @throws {Error} If the data type is unsupported.
     */
    static convertPrimitiveDataType(type) {
        switch (type) {
            case "null":
                return "null";
            case "bool":
                return "bool";
            case "bytes":
            case "address":
                return "bytes";
            case "string":
                return "string";
            case "u64":
            case "u256":
            case "i64":
            case "i256":
            case "bigint":
                return "integer";
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported data type!", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
    }
    /**
     * Parses the fields of a class data type and generates the schema for the class.
     *
     * @param {string} className - The name of the class.
     * @returns {object} The schema for the class.
     */
    static parseClassFields(className, classDef, elements) {
        const ptr = classDef.get(className);
        if (ptr === undefined) {
            js_moi_utils_1.ErrorUtils.throwError(`Invalid class name: ${className}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        const element = elements.get(ptr);
        const schema = {
            kind: "struct",
            fields: {},
        };
        if (element?.kind !== js_moi_utils_1.ElementType.Class) {
            js_moi_utils_1.ErrorUtils.throwError(`Invalid class element: ${className}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        Object.values(element.data.fields).forEach((field) => {
            schema.fields[field.label] = Schema.parseDataType(field.type, classDef, elements);
        });
        return schema;
    }
    /**
     * Parses a data type and generates the corresponding schema based on the
     * data type. The parsing is performed recursively to handle nested data types,
     * such as arrays, maps and class.
     *
     * @param {string} type - The data type string.
     * @returns {object} The schema generated based on the data type.
     * @throws {Error} If the data type is unsupported.
     */
    static parseDataType(type, classDef, elements) {
        switch (true) {
            case (0, exports.isPrimitiveType)(type):
                return {
                    kind: Schema.convertPrimitiveDataType(type),
                };
            case (0, exports.isArray)(type):
                const values = Schema.extractArrayDataType(type);
                return {
                    kind: "array",
                    fields: {
                        values: Schema.parseDataType(values, classDef, elements),
                    },
                };
            case (0, exports.isMap)(type):
                const [key, value] = Schema.extractMapDataType(type);
                return {
                    kind: "map",
                    fields: {
                        keys: Schema.parseDataType(key, classDef, elements),
                        values: Schema.parseDataType(value, classDef, elements),
                    },
                };
            case (0, exports.isClass)(type, classDef):
                return this.parseClassFields(type, classDef, elements);
            default:
                js_moi_utils_1.ErrorUtils.throwError(`Unsupported data type: ${type}!`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
        }
    }
    /**
     * Parses an array of fields and generates the schema based on the fields.
     *
     * @param {LogicManifest.TypeField[]} fields - The array of fields.
     * @returns {PoloSchema} The generated schema based on the fields.
     * @throws {Error} If the fields are invalid or contain unsupported data types.
     */
    parseFields(fields) {
        const schema = {
            kind: "struct",
            fields: {},
        };
        if (!Array.isArray(fields)) {
            js_moi_utils_1.ErrorUtils.throwError("Invalid fields: Fields must be an array.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
        fields.forEach((field) => {
            if (!field || !(field.label && field.type)) {
                js_moi_utils_1.ErrorUtils.throwError("Invalid field: Each field must have a label and a type.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
            }
            schema.fields[field.label] = Schema.parseDataType(field.type, this.classDefs, this.elements);
        });
        return schema;
    }
}
exports.Schema = Schema;
//# sourceMappingURL=schema.js.map