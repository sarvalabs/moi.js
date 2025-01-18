import { Polorizer } from "js-polo";
import { polo, type PoloSchema } from "polo-schema";
import { isValidAddress } from "./address";
import { AssetStandard, OpType } from "./enums";
import { ErrorCode, ErrorUtils } from "./errors";
import { hexToBytes, isHex } from "./hex";
import type { IxOperation, IxOperationPayload, IxRawOperation, PoloIxOperationPayload } from "./types/ix-operation";

export interface IxOperationDescriptor<TOpType extends OpType> {
    /**
     * Returns the POLO schema for the operation payload.
     *
     * @returns Returns the POLO schema for the operation payload.
     */
    schema: () => PoloSchema;
    /**
     * Validates the operation payload.
     *
     * @param payload Operation payload
     * @returns Returns the validation result.
     */
    validator: (payload: IxOperationPayload<TOpType>) => ReturnType<typeof createInvalidResult> | null;
    /**
     * Transforms the operation payload to a format that can be serialized to POLO.
     *
     * @param payload Operation payload
     * @returns Returns the transformed operation payload.
     */
    transform?: (payload: IxOperationPayload<TOpType>) => PoloIxOperationPayload<TOpType>;
}

type IxOperationDescriptorLookup = {
    [key in OpType]?: IxOperationDescriptor<key>;
};

type AssetSupplyOpType = OpType.AssetMint | OpType.AssetBurn;

const createInvalidResult = <T extends Record<any, any>>(value: T, field: keyof T, message: string) => {
    return { field, message, value: value[field] };
};

const createParticipantCreateDescriptor = () => {
    return Object.freeze<IxOperationDescriptor<OpType.ParticipantCreate>>({
        schema: () => {
            return polo.struct({
                address: polo.bytes,
                keys_payload: polo.arrayOf(
                    polo.struct({
                        public_key: polo.bytes,
                        weight: polo.integer,
                        signature_algorithm: polo.integer,
                    })
                ),
                amount: polo.integer,
            });
        },

        transform: (payload) => ({ ...payload, address: hexToBytes(payload.address) }),

        validator: (payload) => {
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
    return Object.freeze<IxOperationDescriptor<OpType.AssetCreate>>({
        schema: () => {
            const logicPayloadSchema = polo.struct({
                manifest: polo.bytes,
                logic_id: polo.string,
                callsite: polo.string,
                calldata: polo.bytes,
                interface: polo.map({ keys: polo.string, values: polo.string }),
            });

            return polo.struct({
                symbol: polo.string,
                supply: polo.integer,
                standard: polo.integer,
                dimension: polo.integer,
                is_stateful: polo.boolean,
                is_logical: polo.boolean,
                logic_payload: logicPayloadSchema,
            });
        },

        validator: (payload) => {
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

const createAssetSupplyDescriptorFor = (type: AssetSupplyOpType) => {
    return Object.freeze<IxOperationDescriptor<AssetSupplyOpType>>({
        schema: () => {
            return polo.struct({
                asset_id: polo.string,
                amount: polo.integer,
            });
        },

        validator: (payload) => {
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

type AssetActionOpType = OpType.AssetTransfer | OpType.AssetApprove | OpType.AssetRelease;

const createAssetActionDescriptor = <T extends AssetActionOpType>(type: T) => {
    return Object.freeze<IxOperationDescriptor<T>>({
        schema: () => {
            return polo.struct({
                benefactor: polo.bytes,
                beneficiary: polo.bytes,
                asset_id: polo.string,
                amount: polo.integer,
                timestamp: polo.integer,
            });
        },

        transform: (payload) => {
            const raw: any = {
                ...payload,
                benefactor: "benefactor" in payload && isHex(payload.benefactor) ? hexToBytes(payload.benefactor) : new Uint8Array(32),
                beneficiary: hexToBytes(payload.beneficiary),
            };

            return raw as PoloIxOperationPayload<T>;
        },

        validator: (payload) => {
            if ("benefactor" in payload && !isValidAddress(payload.benefactor)) {
                return createInvalidResult(payload, "benefactor", "Invalid benefactor address");
            }

            if (!isValidAddress(payload.beneficiary)) {
                return createInvalidResult(payload, "beneficiary", "Invalid beneficiary address");
            }

            if ([OpType.AssetTransfer, OpType.AssetApprove].includes(type)) {
                if (!("amount" in payload)) {
                    return createInvalidResult(payload, "amount" as any, "Amount is required for transfer and approve operations");
                }

                if (payload.amount < 0) {
                    return createInvalidResult(payload, "amount", "Amount cannot be negative");
                }
            }

            if (!isHex(payload.asset_id)) {
                return createInvalidResult(payload, "asset_id", "Invalid asset ID");
            }

            if (type === OpType.AssetApprove) {
                if (!("timestamp" in payload)) {
                    return createInvalidResult(payload, "timestamp" as any, "Timestamp is required for approve operation");
                }
            }

            return null;
        },
    });
};

type LogicActionOpType = OpType.LogicDeploy | OpType.LogicInvoke | OpType.LogicEnlist;

const createLogicActionDescriptor = <T extends LogicActionOpType>(type: T) => {
    return Object.freeze<IxOperationDescriptor<T>>({
        schema: () => {
            return polo.struct({
                manifest: polo.bytes,
                logic_id: polo.string,
                callsite: polo.string,
                calldata: polo.bytes,
                interfaces: polo.map({
                    keys: polo.string,
                    values: polo.string,
                }),
            });
        },

        transform: (payload) => {
            if (type === OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    ErrorUtils.throwError("Manifest is required for LogicDeploy operation", ErrorCode.INVALID_ARGUMENT);
                }

                const raw: PoloIxOperationPayload<OpType.LogicDeploy> = {
                    ...payload,
                    manifest: hexToBytes(payload.manifest),
                    calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                    interfaces: payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
                };

                return raw as PoloIxOperationPayload<T>;
            }

            if (!("logic_id" in payload)) {
                ErrorUtils.throwError("Logic ID is required for LogicEnlist and LogicInvoke operations", ErrorCode.INVALID_ARGUMENT);
            }

            const raw: PoloIxOperationPayload<OpType.LogicEnlist | OpType.LogicInvoke> = {
                ...payload,
                logic_id: payload.logic_id,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            };

            return raw as PoloIxOperationPayload<T>;
        },

        validator: (payload) => {
            if (type === OpType.LogicDeploy) {
                if (!("manifest" in payload)) {
                    return createInvalidResult(payload, "manifest" as keyof typeof payload, "Manifest is required for logic deploy operation");
                }

                if (!isHex(payload.manifest)) {
                    return createInvalidResult(payload, "manifest", "Manifest must be a hex string");
                }
            }

            if (type !== OpType.LogicDeploy || type === OpType.LogicEnlist) {
                if (!("logic_id" in payload)) {
                    return createInvalidResult(payload, "logic_id" as keyof typeof payload, "Logic ID is required");
                }
            }

            if ("calldata" in payload && !isHex(payload.calldata)) {
                return createInvalidResult(payload, "calldata", "Calldata must be a hex string");
            }

            if (payload.callsite == null || payload.callsite === "") {
                return createInvalidResult(payload, "callsite", "Callsite is required");
            }

            return null;
        },
    });
};

const ixOpDescriptor: IxOperationDescriptorLookup = {
    [OpType.ParticipantCreate]: createParticipantCreateDescriptor(),

    [OpType.AssetCreate]: createAssetCreateDescriptor(),
    [OpType.AssetMint]: createAssetSupplyDescriptorFor(OpType.AssetMint),
    [OpType.AssetBurn]: createAssetSupplyDescriptorFor(OpType.AssetBurn),
    [OpType.AssetTransfer]: createAssetActionDescriptor(OpType.AssetTransfer),
    [OpType.AssetApprove]: createAssetActionDescriptor(OpType.AssetApprove),
    [OpType.AssetRelease]: createAssetActionDescriptor(OpType.AssetRelease),

    [OpType.LogicDeploy]: createLogicActionDescriptor(OpType.LogicDeploy),
    [OpType.LogicInvoke]: createLogicActionDescriptor(OpType.LogicInvoke),
    [OpType.LogicEnlist]: createLogicActionDescriptor(OpType.LogicEnlist),
};

type OperationDescriptorRecord<T extends OpType = OpType> = {
    type: T;
    descriptor: IxOperationDescriptor<T>;
};

/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
export const listIxOperationDescriptors = (): OperationDescriptorRecord[] => {
    return Object.entries(ixOpDescriptor).map(([type, descriptor]) => {
        return { type: parseInt(type) as OpType, descriptor };
    });
};

/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export const getIxOperationDescriptor = <TOpType extends OpType>(type: TOpType): IxOperationDescriptor<TOpType> | null => ixOpDescriptor[type] ?? null;

/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export const transformPayload = <TOpType extends OpType>(type: TOpType, payload: IxOperationPayload<TOpType>): PoloIxOperationPayload<TOpType> => {
    const descriptor = getIxOperationDescriptor(type);

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${type}" is not supported`);
    }

    return descriptor.transform?.(payload) ?? (payload as unknown as PoloIxOperationPayload<TOpType>);
};

/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export const encodeOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): IxRawOperation => {
    const descriptor = ixOpDescriptor[operation.type];

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }

    const polorizer = new Polorizer();
    const data = transformPayload(operation.type, operation.payload);

    polorizer.polorize(data, descriptor.schema());

    return { type: operation.type, payload: polorizer.bytes() };
};

/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
export const isValidOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): boolean => {
    return validateOperation(operation) == null;
};

/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
export const validateOperation = <TOpType extends OpType>(operation: IxOperation<TOpType>): ReturnType<IxOperationDescriptor<TOpType>["validator"]> => {
    const descriptor = ixOpDescriptor[operation.type];

    if (descriptor == null) {
        throw new Error(`Descriptor for operation type "${operation.type}" is not registered`);
    }

    return descriptor.validator(operation.payload);
};
