import { type PoloSchema } from "polo-schema";
import { OpType } from "./enums";
import type { IxOperation, IxRawOperation, PoloIxOperationPayload } from "./types/ix-operation";
export interface IxOperationDescriptor<TOpType extends OpType> {
    /**
     * Returns the POLO schema for the operation payload.
     *
     * @returns Returns the POLO schema for the operation payload.
     */
    schema: PoloSchema;
    /**
     * Validates the operation payload.
     *
     * @param payload Operation payload
     * @returns Returns the validation result.
     */
    validator: (operation: IxOperation<TOpType>) => ReturnType<typeof createInvalidResult> | null;
    /**
     * Transforms the operation payload to a format that can be serialized to POLO.
     *
     * @param payload Operation payload
     * @returns Returns the transformed operation payload.
     */
    transform?: (payload: IxOperation<TOpType>) => PoloIxOperationPayload<TOpType>;
}
declare const createInvalidResult: <T extends Record<any, any>>(value: T, field: keyof T, message: string) => {
    field: keyof T;
    message: string;
    value: T[keyof T];
};
/**
 * Checks if a given operation is of a specified type.
 *
 * @param type - The type to check the operation against.
 * @param operation - The operation to check.
 * @returns True if the operation is of the specified type, otherwise false.
 */
export declare const isOperationType: <TOpType extends OpType>(type: TOpType, operation: IxOperation<OpType>) => operation is IxOperation<TOpType>;
type OperationDescriptorRecord<T extends OpType = OpType> = {
    type: T;
    descriptor: IxOperationDescriptor<T>;
};
/**
 * Retrieves all operation descriptors.
 *
 * @returns Returns an array of operation descriptors.
 */
export declare const listIxOperationDescriptors: () => OperationDescriptorRecord[];
/**
 * Retrieves operation descriptor for the given operation type.
 *
 * @param type Operation type
 * @returns Returns the operation descriptor for the given operation type.
 */
export declare const getIxOperationDescriptor: <TOpType extends OpType>(type: TOpType) => IxOperationDescriptor<TOpType> | null;
/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export declare const transformOperationPayload: <TOpType extends OpType>(operation: IxOperation<TOpType>) => PoloIxOperationPayload<TOpType>;
/**
 * Encodes an operation payload to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded payload as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export declare const encodeOperation: <TOpType extends OpType>(operation: IxOperation<TOpType>) => IxRawOperation;
/**
 * Checks if the given operation is valid.
 *
 * @template TOpType - The type of the operation.
 * @param {IxOperation<TOpType>} operation - The operation to validate.
 * @returns {boolean} - Returns `true` if the operation is valid, otherwise `false`.
 */
export declare const isValidOperation: <TOpType extends OpType>(operation: IxOperation<TOpType>) => boolean;
/**
 * Validates the payload of a given operation.
 *
 * @template TOpType - The type of the operation.
 * @param operation - The operation to validate.
 * @returns The result of the validation.
 */
export declare const validateOperation: <TOpType extends OpType>(operation: IxOperation<TOpType>) => ReturnType<IxOperationDescriptor<TOpType>["validator"]>;
export {};
//# sourceMappingURL=operations.d.ts.map