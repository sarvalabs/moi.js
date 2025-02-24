import { type Schema } from "js-polo";
import type { InteractionRequest, RawInteractionRequest } from "./types/interaction";
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
export declare const getInteractionRequestSchema: () => Schema;
/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
export declare const transformInteraction: (ix: InteractionRequest) => RawInteractionRequest;
/**
 * Encodes an interaction request into a POLO bytes.
 *
 * This function takes an interaction request, which can be either an `InteractionRequest`
 * or a `RawInteractionRequest`, and encodes it into a POLO bytes.
 *
 * If the request contains raw interaction, it will be transformed into an raw interaction request
 * that can be serialized to POLO.
 *
 * @param ix - The interaction request to encode. It can be of type `InteractionRequest` or `RawInteractionRequest`.
 * @returns A POLO bytes representing the encoded interaction request.
 */
export declare function encodeInteraction(ix: InteractionRequest | RawInteractionRequest): Uint8Array;
export declare function interaction(ix: InteractionRequest): Uint8Array;
export declare function interaction(ix: InteractionRequest, format: "raw"): RawInteractionRequest;
export declare function interaction(ix: InteractionRequest, format: "polo"): Uint8Array;
export declare function interaction(ix: InteractionRequest, format: "minimal"): InteractionRequest;
declare const createInvalidResult: <T extends Record<any, any>>(value: T, field: keyof T, message: string) => {
    field: keyof T;
    message: string;
    value: T[keyof T];
};
/**
 * Validates an InteractionRequest object.
 *
 * @param ix - The InteractionRequest object to validate.
 * @returns A result from `createInvalidResult` if the validation fails, or `null` if the validation passes.
 *
 * The function performs the following validations:
 * - Checks if the sender is present and has a valid address.
 * - Checks if the fuel price and fuel limit are present and non-negative.
 * - Checks if the sponsor, if present, has a valid address.
 * - Checks if the participants, if present, is an array and each participant has a valid address.
 * - Checks if the operations are present, is an array, and contains at least one operation.
 * - Checks each operation to ensure it has a type and payload, and validates the operation.
 */
export declare function validateIxRequest<TType extends "moi.Execute" | "moi.Simulate">(type: TType, ix: TType extends "moi.Execute" ? InteractionRequest : Omit<InteractionRequest, "fuel_limit">): ReturnType<typeof createInvalidResult> | null;
export {};
//# sourceMappingURL=interaction.d.ts.map