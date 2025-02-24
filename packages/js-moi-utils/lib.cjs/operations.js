"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOperation = exports.isValidOperation = exports.encodeOperation = exports.transformOperationPayload = exports.getIxOperationDescriptor = exports.listIxOperationDescriptors = exports.isOperationType = void 0;
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const enums_1 = require("./enums");
const errors_1 = require("./errors");
const hex_1 = require("./hex");
const createInvalidResult = (value, field, message) => {
    return { field, message, value: value[field] };
};
/**
 * Checks if a given operation is of a specified type.
 *
 * @param type - The type to check the operation against.
 * @param operation - The operation to check.
 * @returns True if the operation is of the specified type, otherwise false.
 */
const isOperationType = (type, operation) => {
    return operation.type === type;
};
exports.isOperationType = isOperationType;
const createParticipantCreateDescriptor = () => {
    return Object.freeze({
        schema: polo_schema_1.polo.struct({
            id: polo_schema_1.polo.bytes,
            keys_payload: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
                public_key: polo_schema_1.polo.bytes,
                weight: polo_schema_1.polo.integer,
                signature_algorithm: polo_schema_1.polo.integer,
            })),
            amount: polo_schema_1.polo.integer,
        }),
        transform: ({ payload }) => {
            const poloKeysPayload = payload.keys_payload.map((payload) => ({
                ...payload,
                public_key: (0, hex_1.hexToBytes)(payload.public_key),
            }));
            return {
                ...payload,
                id: (0, hex_1.hexToBytes)(payload.id),
                keys_payload: poloKeysPayload,
            };
        },
        validator: (operation) => {
            const { payload } = operation;
            if (!(0, hex_1.isHex)(payload.id, 32)) {
                return createInvalidResult(payload, "id", "Invalid identifier");
            }
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            return null;
        },
    });
};
const createAssetCreateDescriptor = () => {
    return Object.freeze({
        schema: polo_schema_1.polo.struct({
            symbol: polo_schema_1.polo.string,
            supply: polo_schema_1.polo.integer,
            standard: polo_schema_1.polo.integer,
            dimension: polo_schema_1.polo.integer,
            is_stateful: polo_schema_1.polo.boolean,
            is_logical: polo_schema_1.polo.boolean,
            logic_payload: polo_schema_1.polo.struct({
                manifest: polo_schema_1.polo.bytes,
                logic_id: polo_schema_1.polo.string,
                callsite: polo_schema_1.polo.string,
                calldata: polo_schema_1.polo.bytes,
                interface: polo_schema_1.polo.map({ keys: polo_schema_1.polo.string, values: polo_schema_1.polo.string }),
            }),
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }
            if (!(payload.standard in enums_1.AssetStandard)) {
                return createInvalidResult(payload, "standard", "Invalid asset standard");
            }
            if (payload.dimension && payload.dimension < 0) {
                return createInvalidResult(payload, "dimension", "Dimension cannot be negative");
            }
            return null;
        },
    });
};
const createAccountConfigureDescriptor = () => {
    const schema = polo_schema_1.polo.struct({
        add: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            public_key: polo_schema_1.polo.bytes,
            weight: polo_schema_1.polo.integer,
            signature_algorithm: polo_schema_1.polo.integer,
        })),
        revoke: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            key_id: polo_schema_1.polo.integer,
        })),
    });
    return Object.freeze({
        schema: schema,
        validator: ({ payload }) => {
            if (payload.add == null || payload.revoke == null) {
                createInvalidResult(payload, "add", "Add and revoke are required");
            }
            for (const key in payload) {
                const value = payload[key];
                if (Object.keys(value).length === 0) {
                    return createInvalidResult(payload, key, `At least value is required in ${key}`);
                }
            }
            return null;
        },
        transform: ({ payload }) => {
            return {
                add: payload.add?.map((key) => ({
                    ...key,
                    public_key: key.public_key ? (0, hex_1.hexToBytes)(key.public_key) : undefined,
                })),
                revoke: payload.revoke,
            };
        },
    });
};
const createAssetSupplyDescriptorFor = () => {
    return Object.freeze({
        schema: polo_schema_1.polo.struct({
            asset_id: polo_schema_1.polo.string,
            amount: polo_schema_1.polo.integer,
        }),
        transform: ({ payload }) => ({
            ...payload,
            asset_id: (0, hex_1.hexToBytes)(payload.asset_id),
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            if (!(0, hex_1.isHex)(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }
            return null;
        },
    });
};
const createAssetActionDescriptor = () => {
    const validateAmount = (payload) => {
        if (payload.amount == null) {
            return createInvalidResult(payload, "amount", "Amount is required for transfer operation");
        }
        if (typeof payload.amount !== "number" || Number.isNaN(payload.amount)) {
            return createInvalidResult(payload, "amount", "Amount must be a number");
        }
        if (payload.amount < 0) {
            return createInvalidResult(payload, "amount", "Amount cannot be negative");
        }
        return null;
    };
    const validateTimestamp = (payload) => {
        if (payload.timestamp == null) {
            return createInvalidResult(payload, "timestamp", "Timestamp is required for approve operation");
        }
        if (typeof payload.timestamp !== "number" || Number.isNaN(payload.timestamp)) {
            return createInvalidResult(payload, "timestamp", "Timestamp must be a number");
        }
        return null;
    };
    const validateBenefactor = (payload) => {
        if (payload.benefactor == null) {
            return createInvalidResult(payload, "benefactor", "Benefactor is required for release operation");
        }
        if (!(0, hex_1.isHex)(payload.benefactor, 32)) {
            return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
        }
        return null;
    };
    return Object.freeze({
        schema: polo_schema_1.polo.struct({
            benefactor: polo_schema_1.polo.bytes,
            beneficiary: polo_schema_1.polo.bytes,
            asset_id: polo_schema_1.polo.string,
            amount: polo_schema_1.polo.integer,
            timestamp: polo_schema_1.polo.integer,
        }),
        transform: ({ payload }) => {
            // @ts-expect-error - This is a hack to fix the type of the payload
            const raw = {
                ...payload,
                asset_id: (0, hex_1.hexToBytes)(payload.asset_id),
                benefactor: "benefactor" in payload && (0, hex_1.isHex)(payload.benefactor, 32) ? (0, hex_1.hexToBytes)(payload.benefactor) : new Uint8Array(32),
                beneficiary: (0, hex_1.hexToBytes)(payload.beneficiary),
            };
            return raw;
        },
        validator: (operation) => {
            if (!operation.payload.asset_id) {
                return createInvalidResult(operation.payload, "asset_id", "Asset ID is required");
            }
            if (!(0, hex_1.isHex)(operation.payload.asset_id, 32)) {
                return createInvalidResult(operation.payload, "asset_id", "Invalid asset ID");
            }
            if (!(0, hex_1.isHex)(operation.payload.beneficiary, 32)) {
                return createInvalidResult(operation.payload, "beneficiary", "Invalid beneficiary address");
            }
            switch (true) {
                case (0, exports.isOperationType)(enums_1.OpType.AssetLockup, operation):
                case (0, exports.isOperationType)(enums_1.OpType.AssetTransfer, operation): {
                    return validateAmount(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetApprove, operation): {
                    return validateAmount(operation.payload) ?? validateTimestamp(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetRelease, operation): {
                    return validateAmount(operation.payload) ?? validateBenefactor(operation.payload) ?? validateAmount(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.AssetRevoke, operation): {
                    return null;
                }
                default: {
                    errors_1.ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, errors_1.ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};
const createLogicActionDescriptor = () => {
    const validateManifest = (payload) => {
        if (!payload.manifest) {
            return createInvalidResult(payload, "manifest", "Manifest is required");
        }
        if (!(0, hex_1.isHex)(payload.manifest)) {
            return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
        }
        return null;
    };
    const validateCalldata = (payload) => {
        if (payload.calldata && !(0, hex_1.isHex)(payload.calldata)) {
            return createInvalidResult(payload, "calldata", "Calldata must be a hex string");
        }
        return null;
    };
    const validateLogicId = (payload) => {
        if (!payload.logic_id) {
            return createInvalidResult(payload, "logic_id", "Logic ID is required");
        }
        return null;
    };
    return Object.freeze({
        schema: polo_schema_1.polo.struct({
            manifest: polo_schema_1.polo.bytes,
            logic_id: polo_schema_1.polo.bytes,
            callsite: polo_schema_1.polo.string,
            calldata: polo_schema_1.polo.bytes,
            interfaces: polo_schema_1.polo.map({
                keys: polo_schema_1.polo.string,
                values: polo_schema_1.polo.string,
            }),
        }),
        transform: ({ payload }) => {
            if ("manifest" in payload) {
                const raw = {
                    ...payload,
                    manifest: (0, hex_1.hexToBytes)(payload.manifest),
                    calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                    interfaces: payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
                };
                return raw;
            }
            if (!("logic_id" in payload)) {
                errors_1.ErrorUtils.throwError("Logic ID is required for LogicEnlist and LogicInvoke operations", errors_1.ErrorCode.INVALID_ARGUMENT);
            }
            return {
                ...payload,
                logic_id: new js_moi_identifiers_1.LogicId(payload.logic_id).toBytes(),
                calldata: payload.calldata != null ? (0, hex_1.hexToBytes)(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            };
        },
        validator: (operation) => {
            if (!operation.payload.callsite) {
                return createInvalidResult(operation.payload, "callsite", "Callsite is required");
            }
            switch (true) {
                case (0, exports.isOperationType)(enums_1.OpType.LogicDeploy, operation): {
                    return validateManifest(operation.payload) ?? validateCalldata(operation.payload);
                }
                case (0, exports.isOperationType)(enums_1.OpType.LogicInvoke, operation):
                case (0, exports.isOperationType)(enums_1.OpType.LogicEnlist, operation): {
                    return validateLogicId(operation.payload) ?? validateCalldata(operation.payload);
                }
                default: {
                    errors_1.ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, errors_1.ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};
const ixOpDescriptor = {
    [enums_1.OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [enums_1.OpType.AccountConfigure]: createAccountConfigureDescriptor(),
    [enums_1.OpType.AssetCreate]: createAssetCreateDescriptor(),
    [enums_1.OpType.AssetMint]: createAssetSupplyDescriptorFor(),
    [enums_1.OpType.AssetBurn]: createAssetSupplyDescriptorFor(),
    [enums_1.OpType.AssetTransfer]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetApprove]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetRelease]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetRevoke]: createAssetActionDescriptor(),
    [enums_1.OpType.AssetLockup]: createAssetActionDescriptor(),
    [enums_1.OpType.LogicDeploy]: createLogicActionDescriptor(),
    [enums_1.OpType.LogicInvoke]: createLogicActionDescriptor(),
    [enums_1.OpType.LogicEnlist]: createLogicActionDescriptor(),
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
const listIxOperationDescriptors = () => {
    const list = Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type), descriptor: descriptor };
    });
    return list;
};
exports.listIxOperationDescriptors = listIxOperationDescriptors;
/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
const getIxOperationDescriptor = (type) => ixOpDescriptor[type] ?? null;
exports.getIxOperationDescriptor = getIxOperationDescriptor;
/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
const transformOperationPayload = (operation) => {
    const descriptor = (0, exports.getIxOperationDescriptor)(operation.type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }
    return descriptor.transform?.(operation) ?? operation.payload;
};
exports.transformOperationPayload = transformOperationPayload;
/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
const encodeOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new js_polo_1.Polorizer();
    const data = (0, exports.transformOperationPayload)(operation);
    polorizer.polorize(data, descriptor.schema);
    return { type: operation.type, payload: polorizer.bytes() };
};
exports.encodeOperation = encodeOperation;
/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
const isValidOperation = (operation) => {
    return (0, exports.validateOperation)(operation) == null;
};
exports.isValidOperation = isValidOperation;
/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
const validateOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    return descriptor.validator(operation);
};
exports.validateOperation = validateOperation;
//# sourceMappingURL=operations.js.map