import { type LogicElement, type TypeField } from "js-moi-utils";
import { Schema as PoloSchema } from "js-polo";
/**
 * Checks if the given type is a primitive type.
 *
 * @param type - The type to check.
 * @returns `true` if the type is a primitive type, otherwise `false`.
 */
export declare const isPrimitiveType: (type: string) => boolean;
/**
 * Checks if the given type string matches the array pattern.
 *
 * @param type - The type string to be checked.
 * @returns `true` if the type string matches the array pattern, otherwise `false`.
 */
export declare const isArray: (type: string) => boolean;
/**
 * Checks if the given type string starts with "map".
 *
 * @param type - The type string to check.
 * @returns `true` if the type string starts with "map", otherwise `false`.
 */
export declare const isMap: (type: string) => boolean;
/**
 * Checks if a given type is present in the class definitions map.
 *
 * @param type - The type to check for in the class definitions.
 * @param classDefs - A map containing class definitions where the key is the class type and the value is a number.
 * @returns `true` if the type is present in the class definitions map, otherwise `false`.
 */
export declare const isClass: (type: string, classDefs: Map<string, number>) => boolean;
/**
 * Schema is a class that provides schema parsing functionality for encoding and
 * decoding manifest, arguments, logic states and other data based on
 * a predefined schema. It supports parsing fields and generating a schema for
 * decoding purposes.
 *
 * @class
 */
export declare class Schema {
    private elements;
    private classDefs;
    constructor(elements: Map<number, LogicElement>, classDefs: Map<string, number>);
    /**
     * Represents the schema for the PISA engine.
     */
    static PISA_ENGINE_SCHEMA: {
        kind: string;
        fields: {
            kind: {
                kind: string;
            };
            flags: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA dependencies.
     */
    static PISA_DEPS_SCHEMA: {
        kind: string;
        fields: {
            values: {
                kind: string;
            };
        };
    };
    /**
     * Schema definition for PISA type field.
     */
    static PISA_TYPE_FIELD_SCHEMA: {
        kind: string;
        fields: {
            values: {
                kind: string;
                fields: {
                    slot: {
                        kind: string;
                    };
                    label: {
                        kind: string;
                    };
                    type: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for the PISA method field.
     */
    static PISA_METHOD_FIELD_SCHEMA: {
        kind: string;
        fields: {
            values: {
                kind: string;
                fields: {
                    ptr: {
                        kind: string;
                    };
                    code: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA instructions.
     */
    static PISA_INSTRUCTIONS_SCHEMA: {
        kind: string;
        fields: {
            bin: {
                kind: string;
            };
            hex: {
                kind: string;
            };
            asm: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA state.
     */
    static PISA_STATE_SCHEMA: {
        kind: string;
        fields: {
            mode: {
                kind: string;
            };
            fields: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA constant.
     */
    static PISA_CONSTANT_SCHEMA: {
        kind: string;
        fields: {
            type: {
                kind: string;
            };
            value: {
                kind: string;
            };
        };
    };
    /**
     * Schema definition for PISA typedef.
     */
    static PISA_TYPEDEF_SCHEMA: {
        kind: string;
        fields: {};
    };
    /**
     * Schema definition for PISA class.
     */
    static PISA_CLASS_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            fields: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            methods: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            ptr: {
                                kind: string;
                            };
                            code: {
                                kind: string;
                            };
                        };
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA routine.
     */
    static PISA_ROUTINE_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            mode: {
                kind: string;
            };
            kind: {
                kind: string;
            };
            accepts: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            returns: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            executes: {
                kind: string;
                fields: {
                    bin: {
                        kind: string;
                    };
                    hex: {
                        kind: string;
                    };
                    asm: {
                        kind: string;
                        fields: {
                            values: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            catches: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA method.
     */
    static PISA_METHOD_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            class: {
                kind: string;
            };
            mutable: {
                kind: string;
            };
            accepts: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            returns: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            executes: {
                kind: string;
                fields: {
                    bin: {
                        kind: string;
                    };
                    hex: {
                        kind: string;
                    };
                    asm: {
                        kind: string;
                        fields: {
                            values: {
                                kind: string;
                            };
                        };
                    };
                };
            };
            catches: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA event.
     */
    static PISA_EVENT_SCHEMA: {
        kind: string;
        fields: {
            name: {
                kind: string;
            };
            topics: {
                kind: string;
            };
            fields: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                        fields: {
                            slot: {
                                kind: string;
                            };
                            label: {
                                kind: string;
                            };
                            type: {
                                kind: string;
                            };
                        };
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA exception.
     */
    static PISA_EXCEPTION_SCHEMA: {
        kind: string;
        fields: {
            class: {
                kind: string;
            };
            error: {
                kind: string;
            };
            revert: {
                kind: string;
            };
            trace: {
                kind: string;
                fields: {
                    values: {
                        kind: string;
                    };
                };
            };
        };
    };
    /**
     * Schema definition for PISA result.
     */
    static PISA_RESULT_SCHEMA: {
        kind: string;
        fields: {
            outputs: {
                kind: string;
            };
            error: {
                kind: string;
            };
        };
    };
    /**
     * Schema definition for PISA log.
     */
    static PISA_BUILT_IN_LOG_SCHEMA: {
        kind: string;
        fields: {
            value: {
                kind: string;
            };
        };
    };
    /**
     * Extracts the array data type from the provided data type string.
     *
     * @param {string} dataType - The array data type, eg:"[]u64".
     * @returns {string} The extracted array data type.
     * @throws {Error} If the array type is invalid or unsupported.
     */
    static extractArrayDataType(dataType: string): string;
    /**
     * Extracts the key and value data types from the provided map data type string.
     *
     * @param {string} dataType - The map data type. eg:"map[u64]string".
     * @returns The extracted key and value data types as a tuple.
     * @throws {Error} If the map data type is invalid or unsupported.
     */
    static extractMapDataType(dataType: string): [string, string];
    /**
     * Converts the primitive data type to a standardized representation.
     *
     * @param {string} type - The primitive data type.
     * @returns {string} The converted data type.
     * @throws {Error} If the data type is unsupported.
     */
    static convertPrimitiveDataType(type: string): string;
    /**
     * Parses the fields of a class data type and generates the schema for the class.
     *
     * @param {string} className - The name of the class.
     * @returns {object} The schema for the class.
     */
    static parseClassFields(className: string, classDef: Map<string, number>, elements: Map<number, LogicElement>): PoloSchema;
    /**
     * Parses a data type and generates the corresponding schema based on the
     * data type. The parsing is performed recursively to handle nested data types,
     * such as arrays, maps and class.
     *
     * @param {string} type - The data type string.
     * @returns {object} The schema generated based on the data type.
     * @throws {Error} If the data type is unsupported.
     */
    static parseDataType(type: string, classDef: Map<string, number>, elements: Map<number, LogicElement>): PoloSchema;
    /**
     * Parses an array of fields and generates the schema based on the fields.
     *
     * @param {LogicManifest.TypeField[]} fields - The array of fields.
     * @returns {PoloSchema} The generated schema based on the fields.
     * @throws {Error} If the fields are invalid or contain unsupported data types.
     */
    parseFields(fields: TypeField[]): PoloSchema;
}
//# sourceMappingURL=schema.d.ts.map