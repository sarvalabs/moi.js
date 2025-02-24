import { ElementType, ErrorCode, ErrorUtils, type LogicElement, type TypeField } from "js-moi-utils";
import { Schema as PoloSchema } from "js-polo";

const ARRAY_MATCHER_REGEX = /^\[(\d*)\]/;

const primitiveTypes = ["null", "bool", "bytes", "address", "string", "u64", "u256", "i64", "i256", "bigint"];

export const isPrimitiveType = (type: string): boolean => {
    return primitiveTypes.includes(type);
};

export const isArray = (type: string): boolean => {
    return ARRAY_MATCHER_REGEX.test(type);
};

export const isMap = (type: string): boolean => {
    return type.startsWith("map");
};

export const isClass = (type: string, classDefs: Map<string, number>): boolean => {
    return classDefs.has(type);
};

/**
 * Schema is a class that provides schema parsing functionality for encoding and
 * decoding manifest, arguments, logic states and other data based on
 * a predefined schema. It supports parsing fields and generating a schema for
 * decoding purposes.
 *
 * @class
 */
export class Schema {
    private elements: Map<number, LogicElement>;
    private classDefs: Map<string, number>;

    constructor(elements: Map<number, LogicElement>, classDefs: Map<string, number>) {
        this.elements = elements;
        this.classDefs = classDefs;
    }

    public static PISA_ENGINE_SCHEMA = {
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

    public static PISA_DEPS_SCHEMA = {
        kind: "array",
        fields: {
            values: {
                kind: "integer",
            },
        },
    };

    public static PISA_TYPE_FIELD_SCHEMA = {
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

    public static PISA_METHOD_FIELD_SCHEMA = {
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

    public static PISA_INSTRUCTIONS_SCHEMA = {
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

    public static PISA_STATE_SCHEMA = {
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

    public static PISA_CONSTANT_SCHEMA = {
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

    public static PISA_TYPEDEF_SCHEMA = {
        kind: "string",
        fields: {},
    };

    public static PISA_CLASS_SCHEMA = {
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

    public static PISA_ROUTINE_SCHEMA = {
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

    public static PISA_METHOD_SCHEMA = {
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

    public static PISA_EVENT_SCHEMA = {
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

    public static PISA_EXCEPTION_SCHEMA = {
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

    public static PISA_RESULT_SCHEMA = {
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

    public static PISA_BUILT_IN_LOG_SCHEMA = {
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
    public static extractArrayDataType(dataType: string): string {
        if (!isArray(dataType)) {
            ErrorUtils.throwError("Invalid array type: The provided data type is not an array.", ErrorCode.INVALID_ARGUMENT);
        }

        const type = dataType.replace(ARRAY_MATCHER_REGEX, "");

        if (type === "") {
            ErrorUtils.throwError("Failed to extract array type: The array type could not be determined.", ErrorCode.INVALID_ARGUMENT);
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
    public static extractMapDataType(dataType: string): [string, string] {
        let brackets: string[] = [];
        let startIndex: number = 0;
        let endIndex: number = 0;

        for (let i = 0; i < dataType.length; i++) {
            if (dataType.charAt(i) == "[") {
                if (startIndex === 0) {
                    startIndex = i + 1;
                }

                brackets.push("[");
            } else if (dataType.charAt(i) == "]") {
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
            ErrorUtils.throwError("Failed to extract map type: The key or value type of the map could not be determined.", ErrorCode.INVALID_ARGUMENT);
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
    public static convertPrimitiveDataType(type: string): string {
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
                ErrorUtils.throwError("Unsupported data type!", ErrorCode.UNSUPPORTED_OPERATION);
        }
    }

    /**
     * Parses the fields of a class data type and generates the schema for the class.
     *
     * @param {string} className - The name of the class.
     * @returns {object} The schema for the class.
     */
    public static parseClassFields(className: string, classDef: Map<string, number>, elements: Map<number, LogicElement>): PoloSchema {
        const ptr = classDef.get(className);
        if (ptr === undefined) {
            ErrorUtils.throwError(`Invalid class name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }

        const element = elements.get(ptr);

        const schema = {
            kind: "struct",
            fields: {},
        };

        if (element?.kind !== ElementType.Class) {
            ErrorUtils.throwError(`Invalid class element: ${className}`, ErrorCode.INVALID_ARGUMENT);
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
    public static parseDataType(type: string, classDef: Map<string, number>, elements: Map<number, LogicElement>): PoloSchema {
        switch (true) {
            case isPrimitiveType(type):
                return {
                    kind: Schema.convertPrimitiveDataType(type),
                };
            case isArray(type):
                const values = Schema.extractArrayDataType(type);
                return {
                    kind: "array",
                    fields: {
                        values: Schema.parseDataType(values, classDef, elements),
                    },
                };
            case isMap(type):
                const [key, value] = Schema.extractMapDataType(type);
                return {
                    kind: "map",
                    fields: {
                        keys: Schema.parseDataType(key, classDef, elements),
                        values: Schema.parseDataType(value, classDef, elements),
                    },
                };
            case isClass(type, classDef):
                return this.parseClassFields(type, classDef, elements);
            default:
                ErrorUtils.throwError(`Unsupported data type: ${type}!`, ErrorCode.UNSUPPORTED_OPERATION);
        }
    }

    /**
     * Parses an array of fields and generates the schema based on the fields.
     *
     * @param {LogicManifest.TypeField[]} fields - The array of fields.
     * @returns {PoloSchema} The generated schema based on the fields.
     * @throws {Error} If the fields are invalid or contain unsupported data types.
     */
    public parseFields(fields: TypeField[]): PoloSchema {
        const schema = {
            kind: "struct",
            fields: {},
        };

        if (!Array.isArray(fields)) {
            ErrorUtils.throwError("Invalid fields: Fields must be an array.", ErrorCode.INVALID_ARGUMENT);
        }

        fields.forEach((field) => {
            if (!field || !(field.label && field.type)) {
                ErrorUtils.throwError("Invalid field: Each field must have a label and a type.", ErrorCode.INVALID_ARGUMENT);
            }

            schema.fields[field.label] = Schema.parseDataType(field.type, this.classDefs, this.elements);
        });

        return schema;
    }
}
