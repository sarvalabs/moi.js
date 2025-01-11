import { type PoloSchema } from "polo-schema";
import { OpType } from "./enums";
import type { Operation } from "./types/ix-operation";
import type { OperationPayload, PoloOperationPayload } from "./types/ix-payload";
export type IxOperationValidationResult = {
    reason: string;
    field: string;
    value: any;
} | null;
export interface IxOperationDescriptor<TOpType extends OpType> {
    schema: () => PoloSchema;
    validator: (payload: OperationPayload<TOpType>) => IxOperationValidationResult;
    transform?: (payload: OperationPayload<TOpType>) => PoloOperationPayload<TOpType>;
}
/**
 * Transforms the operation payload to a format that can be serialized to POLO.
 *
 * @param type Operation type
 * @param payload Operation payload
 * @returns Returns the transformed operation payload.
 */
export declare const transformPayload: <TOpType extends OpType>(type: TOpType, payload: OperationPayload<TOpType>) => PoloOperationPayload<TOpType>;
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
 * Encodes an operation to a POLO byte array.
 *
 * @param operation Operation to encode
 * @returns Returns the encoded operation as a POLO byte array.
 *
 * @throws Throws an error if the operation type is not registered.
 */
export declare const encodeIxOperationToPolo: <TOpType extends OpType>(operation: Operation<TOpType>) => Uint8Array;
export {};
//# sourceMappingURL=operations.d.ts.map