import { ErrorCode, ErrorUtils } from "js-moi-utils";
export class InteractionSerializer {
    static serializers = new Map();
    static IX_POLO_SCHEMA = {
        kind: "struct",
        fields: {
            sender: {
                kind: "struct",
                fields: {
                    address: {
                        kind: "bytes",
                    },
                    sequence: {
                        kind: "integer",
                    },
                    key_id: {
                        kind: "integer",
                    },
                },
            },
            payer: {
                kind: "struct",
                fields: {
                    address: {
                        kind: "bytes",
                    },
                    sequence: {
                        kind: "integer",
                    },
                    key_id: {
                        kind: "integer",
                    },
                },
            },
            fuel_limit: {
                kind: "integer",
            },
            fuel_tip: {
                kind: "integer",
            },
            operations: {
                kind: "array",
                fields: {
                    kind: "struct",
                    fields: {
                        type: {
                            kind: "integer",
                        },
                        payload: {
                            kind: "bytes",
                        },
                    },
                },
            },
        },
    };
    serializeOperation(operation) {
        const serializer = InteractionSerializer.serializers.get(operation.type);
        if (serializer == null) {
            ErrorUtils.throwError(`Serializer for operation type "${operation.type}" is not registered. Please pass the correct operation type or register a serializer for the given operation type.`, ErrorCode.NOT_INITIALIZED);
        }
        return serializer.serialize(operation.payload);
    }
    serialize(interaction) {
        return InteractionSerializer.IX_POLO_SCHEMA;
    }
    /**
     * Register a serializer for a given operation type
     *
     * If a serializer is already registered for the given operation type, it will be overwritten
     *
     * @param serializer The serializer to register
     * @returns void
     */
    static register(serializer) {
        this.serializers.set(serializer.type, serializer);
    }
    static {
        // Register all serializers
        // this.register(new ParticipantCreateSerializer());
    }
}
//# sourceMappingURL=serializer.js.map