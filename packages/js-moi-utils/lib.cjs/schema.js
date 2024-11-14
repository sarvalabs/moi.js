"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.builtInLogEventSchema = exports.ixObjectSchema = exports.assetSupplySchema = exports.assetActionSchema = exports.assetCreateSchema = exports.participantCreateSchema = exports.logicSchema = void 0;
exports.logicSchema = {
    kind: "struct",
    fields: {
        manifest: {
            kind: "bytes"
        },
        logic_id: {
            kind: "string"
        },
        callsite: {
            kind: "string"
        },
        calldata: {
            kind: "bytes"
        },
        interface: {
            kind: "map",
            fields: {
                keys: {
                    kind: "string"
                },
                values: {
                    kind: "string"
                }
            }
        }
    }
};
exports.participantCreateSchema = {
    kind: "struct",
    fields: {
        address: {
            kind: "bytes"
        },
        amount: {
            kind: "integer"
        }
    }
};
exports.assetCreateSchema = {
    kind: "struct",
    fields: {
        symbol: {
            kind: "string"
        },
        supply: {
            kind: "integer"
        },
        standard: {
            kind: "integer"
        },
        dimension: {
            kind: "integer"
        },
        is_stateful: {
            kind: "bool"
        },
        is_logical: {
            kind: "bool"
        },
        logic_payload: exports.logicSchema
    }
};
exports.assetActionSchema = {
    kind: "struct",
    fields: {
        benefactor: {
            kind: "bytes"
        },
        beneficiary: {
            kind: "bytes"
        },
        asset_id: {
            kind: "string"
        },
        amount: {
            kind: "integer"
        }
    }
};
exports.assetSupplySchema = {
    kind: "struct",
    fields: {
        asset_id: {
            kind: "string"
        },
        amount: {
            kind: "integer"
        }
    }
};
exports.ixObjectSchema = {
    kind: "struct",
    fields: {
        sender: {
            kind: "bytes"
        },
        payer: {
            kind: "bytes"
        },
        nonce: {
            kind: "integer"
        },
        fuel_price: {
            kind: "integer"
        },
        fuel_limit: {
            kind: "integer"
        },
        funds: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        asset_id: {
                            kind: "string"
                        },
                        amount: {
                            kind: "integer"
                        }
                    }
                }
            }
        },
        ix_operations: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        type: {
                            kind: "integer"
                        },
                        payload: {
                            kind: "bytes"
                        }
                    }
                }
            }
        },
        participants: {
            kind: "array",
            fields: {
                values: {
                    kind: "struct",
                    fields: {
                        address: {
                            kind: "bytes"
                        },
                        lock_type: {
                            kind: "integer"
                        }
                    }
                }
            }
        },
        perception: {
            kind: "bytes"
        },
        preferences: {
            kind: "struct",
            fields: {
                compute: {
                    kind: "bytes"
                },
                consensus: {
                    kind: "bytes"
                }
            }
        }
    }
};
exports.builtInLogEventSchema = {
    kind: "struct",
    fields: {
        value: {
            kind: "string"
        }
    }
};
//# sourceMappingURL=schema.js.map