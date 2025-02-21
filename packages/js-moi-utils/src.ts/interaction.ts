import { ZERO_ADDRESS } from "js-moi-constants";
import { AssetId, LogicId, ParticipantId } from "js-moi-identifiers";
import { Polorizer, type Schema } from "js-polo";
import { polo } from "polo-schema";
import { LockType, OpType } from "./enums";
import { hexToBytes, isHex, type Hex } from "./hex";
import { encodeOperation, validateOperation } from "./operations";
import type { InteractionRequest, IxParticipant, RawInteractionRequest } from "./types/interaction";

/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
export const getInteractionRequestSchema = (): Schema => {
    return polo.struct({
        sender: polo.struct({
            id: polo.bytes,
            sequence: polo.integer,
            key_id: polo.integer,
        }),
        sponsor: polo.struct({
            id: polo.bytes,
            sequence: polo.integer,
            key_id: polo.integer,
        }),
        fuel_price: polo.integer,
        fuel_limit: polo.integer,
        ix_operations: polo.arrayOf(
            polo.struct({
                type: polo.integer,
                payload: polo.bytes,
            })
        ),
        participants: polo.arrayOf(
            polo.struct({
                id: polo.bytes,
                lock_type: polo.integer,
                notary: polo.boolean,
            })
        ),
        preferences: polo.struct({
            compute: polo.bytes,
            consensus: polo.struct({
                mtq: polo.integer,
                trust_nodes: polo.arrayOf(polo.string),
            }),
        }),
        perception: polo.bytes,
    });
};

/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
export const transformInteraction = (ix: InteractionRequest): RawInteractionRequest => {
    return {
        ...ix,
        sender: { ...ix.sender, id: new ParticipantId(ix.sender.id).toBytes() },
        sponsor: ix.sponsor ? { ...ix.sponsor, id: new ParticipantId(ix.sponsor.id).toBytes() } : { id: hexToBytes(ZERO_ADDRESS), key_id: 0, sequence: 0 },
        ix_operations: ix.operations.map(encodeOperation),
        participants: ix.participants?.map((participant) => ({ ...participant, id: hexToBytes(participant.id) })),
        perception: ix.perception ? hexToBytes(ix.perception) : undefined,
        preferences: ix.preferences ? { ...ix.preferences, compute: hexToBytes(ix.preferences.compute) } : undefined,
    };
};

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
export function encodeInteraction(ix: InteractionRequest | RawInteractionRequest): Uint8Array {
    const data = "operations" in ix ? transformInteraction(ix) : ix;
    const polorizer = new Polorizer();

    polorizer.polorize(data, getInteractionRequestSchema());
    return polorizer.bytes();
}

const gatherIxParticipants = (interaction: InteractionRequest) => {
    const participants = new Map<Hex, IxParticipant>([
        [
            interaction.sender.id,
            {
                id: interaction.sender.id,
                lock_type: LockType.MutateLock,
                notary: false,
            },
        ],
    ]);

    if (interaction.sponsor != null) {
        participants.set(interaction.sponsor.id, {
            id: interaction.sponsor.id,
            lock_type: LockType.MutateLock,
            notary: false,
        });
    }

    for (const { type, payload } of interaction.operations) {
        switch (type) {
            case OpType.ParticipantCreate: {
                participants.set(payload.id, {
                    id: payload.id,
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }

            case OpType.AssetMint:
            case OpType.AssetBurn: {
                const identifier = new AssetId(payload.asset_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }

            case OpType.AssetTransfer:
            case OpType.AssetApprove:
            case OpType.AssetRevoke:
            case OpType.AssetLockup:
            case OpType.AssetRelease: {
                participants.set(payload.beneficiary, {
                    id: payload.beneficiary,
                    lock_type: LockType.MutateLock,
                    notary: false,
                });

                if ("benefactor" in payload && payload.benefactor != null) {
                    participants.set(payload.benefactor, {
                        id: payload.benefactor,
                        lock_type: LockType.MutateLock,
                        notary: false,
                    });
                }
                break;
            }

            case OpType.LogicInvoke:
            case OpType.LogicEnlist: {
                const identifier = new LogicId(payload.logic_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: LockType.MutateLock,
                    notary: false,
                });
                break;
            }
        }
    }

    for (const participant of interaction.participants ?? []) {
        if (participants.has(participant.id)) {
            continue;
        }

        participants.set(participant.id, participant);
    }

    return Array.from(participants.values());
};

export function interaction(ix: InteractionRequest): Uint8Array;
export function interaction(ix: InteractionRequest, format: "raw"): RawInteractionRequest;
export function interaction(ix: InteractionRequest, format: "polo"): Uint8Array;
export function interaction(ix: InteractionRequest, format: "minimal"): InteractionRequest;
/**
 * Creates a POLO bytes from an interaction request.
 *
 * It smartly gathers the participants and funds from the interaction request and then encodes the interaction request.
 *
 * @param ix - The interaction request to encode.
 * @returns A POLO bytes representing the encoded interaction request.
 */
export function interaction(ix: InteractionRequest, format: "raw" | "polo" | "minimal" = "polo"): RawInteractionRequest | Uint8Array | InteractionRequest {
    const interaction: InteractionRequest = {
        ...ix,
        participants: gatherIxParticipants(ix),
    };

    switch (format) {
        case "minimal":
            return interaction;
        case "raw":
            return transformInteraction(interaction);
        case "polo":
            return encodeInteraction(interaction);
        default:
            throw new Error(`Invalid format: ${format}`);
    }
}

const createInvalidResult = <T extends Record<any, any>>(value: T, field: keyof T, message: string) => {
    return { field, message, value: value[field] };
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
export function validateIxRequest<TType extends "moi.Execute" | "moi.Simulate">(
    type: TType,
    ix: TType extends "moi.Execute" ? InteractionRequest : Omit<InteractionRequest, "fuel_limit">
): ReturnType<typeof createInvalidResult> | null {
    if (ix.sender == null) {
        return createInvalidResult(ix, "sender", "Sender is required");
    }

    if (!isHex(ix.sender.id, 32)) {
        return createInvalidResult(ix.sender, "id", "Invalid sender address");
    }

    if (ix.fuel_price == null) {
        return createInvalidResult(ix, "fuel_price", "Fuel price is required");
    }

    // @ts-ignore - The fuel_limit field is not present in the Simulate type.
    if (type === "moi.Execute" && ix["fuel_limit"] == null) {
        return createInvalidResult(<InteractionRequest>ix, "fuel_limit", "Fuel limit is required");
    }

    if (ix.fuel_price < 0) {
        return createInvalidResult(ix, "fuel_price", "Fuel price must be greater than or equal to 0");
    }

    // @ts-ignore - The fuel_limit field is not present in the Simulate type.
    if (type === "moi.Execute" && ix["fuel_limit"] < 0) {
        return createInvalidResult(<InteractionRequest>ix, "fuel_limit", "Fuel limit must be greater than or equal to 0");
    }

    if (ix.sponsor != null && !isHex(ix.sender.id, 32)) {
        return createInvalidResult(ix, "sponsor", "Invalid sponser address");
    }

    if (ix.participants != null) {
        if (!Array.isArray(ix.participants)) {
            return createInvalidResult(ix, "participants", "Participants must be an array");
        }

        let error: ReturnType<typeof createInvalidResult> | null = null;

        for (const participant of ix.participants) {
            if (error != null) {
                return error;
            }

            if (!isHex(participant.id, 32)) {
                error = createInvalidResult(participant, "id", "Invalid participant address");
                break;
            }
        }
    }

    if (ix.operations == null) {
        return createInvalidResult(ix, "operations", "Operations are required");
    }

    if (!Array.isArray(ix.operations)) {
        return createInvalidResult(ix, "operations", "Operations must be an array");
    }

    if (ix.operations.length === 0) {
        return createInvalidResult(ix, "operations", "Operations must have at least one operation");
    }

    let error: ReturnType<typeof createInvalidResult> | null = null;

    for (let i = 0; i < ix.operations.length; i++) {
        if (error != null) {
            break;
        }

        const operation = ix.operations[i];

        if (operation.type == null) {
            error = createInvalidResult(operation, "type", "Operation type is required");
            break;
        }

        if (operation.payload == null) {
            error = createInvalidResult(operation, "payload", "Operation payload is required");
            break;
        }

        const result = validateOperation(operation);

        if (result == null) {
            continue;
        }

        error = {
            field: `operations[${i}].${result.field}`,
            message: `Invalid operation payload at index ${i}: ${result.message}`,
            value: operation,
        };
    }

    if (error != null) {
        return error;
    }

    return null;
}
