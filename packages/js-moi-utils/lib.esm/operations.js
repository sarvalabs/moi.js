import { Polorizer } from "js-polo";
import { polo } from "polo-schema";
import { isValidAddress } from "./address";
import { AssetStandard, OpType } from "./enums";
import { ErrorCode, ErrorUtils } from "./errors";
import { hexToBytes, isAddress, isHex } from "./hex";
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
const createParticipantCreateDescriptor = () => {
    return Object.freeze({
        schema: polo.struct({
            address: polo.bytes,
            keys_payload: polo.arrayOf(polo.struct({
                public_key: polo.bytes,
                weight: polo.integer,
                signature_algorithm: polo.integer,
            })),
            amount: polo.integer,
        }),
        transform: ({ payload }) => ({ ...payload, address: hexToBytes(payload.address) }),
        validator: (operation) => {
            const { payload } = operation;
            if (!isValidAddress(payload.address)) {
                return createInvalidResult(payload, "address", "Invalid address");
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
        schema: polo.struct({
            symbol: polo.string,
            supply: polo.integer,
            standard: polo.integer,
            dimension: polo.integer,
            is_stateful: polo.boolean,
            is_logical: polo.boolean,
            logic_payload: polo.struct({
                manifest: polo.bytes,
                logic_id: polo.string,
                callsite: polo.string,
                calldata: polo.bytes,
                interface: polo.map({ keys: polo.string, values: polo.string }),
            }),
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (payload.supply < 0) {
                return createInvalidResult(payload, "supply", "Supply cannot be negative");
            }
            if (!(payload.standard in AssetStandard)) {
                return createInvalidResult(payload, "standard", "Invalid asset standard");
            }
            if (payload.dimension && payload.dimension < 0) {
                return createInvalidResult(payload, "dimension", "Dimension cannot be negative");
            }
            return null;
        },
    });
};
const createAssetSupplyDescriptorFor = () => {
    return Object.freeze({
        schema: polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        }),
        validator: (operation) => {
            const { payload } = operation;
            if (payload.amount < 0) {
                return createInvalidResult(payload, "amount", "Amount cannot be negative");
            }
            if (!isHex(payload.asset_id)) {
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
        if (!isAddress(payload.benefactor)) {
            return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
        }
        return null;
    };
    return Object.freeze({
        schema: polo.struct({
            benefactor: polo.bytes,
            beneficiary: polo.bytes,
            asset_id: polo.string,
            amount: polo.integer,
            timestamp: polo.integer,
        }),
        transform: ({ payload }) => {
            // @ts-expect-error - This is a hack to fix the type of the payload
            const raw = {
                ...payload,
                benefactor: "benefactor" in payload && isValidAddress(payload.benefactor) ? hexToBytes(payload.benefactor) : new Uint8Array(32),
                beneficiary: hexToBytes(payload.beneficiary),
            };
            return raw;
        },
        validator: (operation) => {
            if (!operation.payload.asset_id) {
                return createInvalidResult(operation.payload, "asset_id", "Asset ID is required");
            }
            if (!isHex(operation.payload.asset_id)) {
                return createInvalidResult(operation.payload, "asset_id", "Invalid asset ID");
            }
            if (!isValidAddress(operation.payload.beneficiary)) {
                return createInvalidResult(operation.payload, "beneficiary", "Invalid beneficiary address");
            }
            switch (true) {
                case isOperationType(OpType.AssetLockup, operation):
                case isOperationType(OpType.AssetTransfer, operation): {
                    return validateAmount(operation.payload);
                }
                case isOperationType(OpType.AssetApprove, operation): {
                    return validateAmount(operation.payload) ?? validateTimestamp(operation.payload);
                }
                case isOperationType(OpType.AssetRelease, operation): {
                    return validateAmount(operation.payload) ?? validateBenefactor(operation.payload) ?? validateAmount(operation.payload);
                }
                default: {
                    ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, ErrorCode.INVALID_ARGUMENT);
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
        if (!isHex(payload.manifest)) {
            return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
        }
        return null;
    };
    const validateCalldata = (payload) => {
        if (payload.calldata && !isHex(payload.calldata)) {
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
        schema: polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interfaces: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        }),
        transform: ({ payload }) => {
            if ("manifest" in payload) {
                const raw = {
                    ...payload,
                    manifest: hexToBytes(payload.manifest),
                    calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                    interfaces: payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
                };
                return raw;
            }
            if (!("logic_id" in payload)) {
                ErrorUtils.throwError("Logic ID is required for LogicEnlist and LogicInvoke operations", ErrorCode.INVALID_ARGUMENT);
            }
            return {
                ...payload,
                logic_id: payload.logic_id,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            };
        },
        validator: (operation) => {
            if (!operation.payload.callsite) {
                return createInvalidResult(operation.payload, "callsite", "Callsite is required");
            }
            switch (true) {
                case isOperationType(OpType.LogicDeploy, operation): {
                    return validateManifest(operation.payload) ?? validateCalldata(operation.payload);
                }
                case isOperationType(OpType.LogicInvoke, operation):
                case isOperationType(OpType.LogicEnlist, operation): {
                    return validateLogicId(operation.payload) ?? validateCalldata(operation.payload);
                }
                default: {
                    ErrorUtils.throwError(`Operation type "${operation.type}" is not supported`, ErrorCode.INVALID_ARGUMENT);
                }
            }
        },
    });
};
const ixOpDescriptor = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),
    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(),
    [OpType.AssetTransfer]: createAssetActionDescriptor(),
    [OpType.AssetApprove]: createAssetActionDescriptor(),
    [OpType.AssetRelease]: createAssetActionDescriptor(),
    [OpType.AssetRevoke]: createAssetActionDescriptor(),
    [OpType.AssetLockup]: createAssetActionDescriptor(),
    [OpType.LogicDeploy]: createLogicActionDescriptor(),
    [OpType.LogicInvoke]: createLogicActionDescriptor(),
    [OpType.LogicEnlist]: createLogicActionDescriptor(),
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
export const listIxOperationDescriptors = () => {
    const list = Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type), descriptor: descriptor };
    });
    return list;
};
/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export const getIxOperationDescriptor = (type) => ixOpDescriptor[type] ?? null;
/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export const transformOperationPayload = (operation) => {
    const descriptor = getIxOperationDescriptor(operation.type);
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not supported`);
    }
    return descriptor.transform?.(operation) ?? operation.payload;
};
/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    const polorizer = new Polorizer();
    const data = transformOperationPayload(operation);
    polorizer.polorize(data, descriptor.schema);
    return { type: operation.type, payload: polorizer.bytes() };
};
/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
export const isValidOperation = (operation) => {
    return validateOperation(operation) == null;
};
/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
export const validateOperation = (operation) => {
    const descriptor = ixOpDescriptor[operation.type];
    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }
    return descriptor.validator(operation);
};
//# sourceMappingURL=operations.js.map