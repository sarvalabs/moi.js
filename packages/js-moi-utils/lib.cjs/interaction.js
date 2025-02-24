"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformInteraction = exports.getInteractionRequestSchema = void 0;
exports.encodeInteraction = encodeInteraction;
exports.interaction = interaction;
exports.validateIxRequest = validateIxRequest;
const js_moi_constants_1 = require("js-moi-constants");
const js_moi_identifiers_1 = require("js-moi-identifiers");
const js_polo_1 = require("js-polo");
const polo_schema_1 = require("polo-schema");
const enums_1 = require("./enums");
const hex_1 = require("./hex");
const operations_1 = require("./operations");
/**
 * Generates and returns the POLO schema for an interaction request.
 *
 * @returns The POLO schema for an interaction request.
 */
const getInteractionRequestSchema = () => {
    return polo_schema_1.polo.struct({
        sender: polo_schema_1.polo.struct({
            id: polo_schema_1.polo.bytes,
            sequence: polo_schema_1.polo.integer,
            key_id: polo_schema_1.polo.integer,
        }),
        sponsor: polo_schema_1.polo.struct({
            id: polo_schema_1.polo.bytes,
            sequence: polo_schema_1.polo.integer,
            key_id: polo_schema_1.polo.integer,
        }),
        fuel_price: polo_schema_1.polo.integer,
        fuel_limit: polo_schema_1.polo.integer,
        ix_operations: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            type: polo_schema_1.polo.integer,
            payload: polo_schema_1.polo.bytes,
        })),
        participants: polo_schema_1.polo.arrayOf(polo_schema_1.polo.struct({
            id: polo_schema_1.polo.bytes,
            lock_type: polo_schema_1.polo.integer,
            notary: polo_schema_1.polo.boolean,
        })),
        preferences: polo_schema_1.polo.struct({
            compute: polo_schema_1.polo.bytes,
            consensus: polo_schema_1.polo.struct({
                mtq: polo_schema_1.polo.integer,
                trust_nodes: polo_schema_1.polo.arrayOf(polo_schema_1.polo.string),
            }),
        }),
        perception: polo_schema_1.polo.bytes,
    });
};
exports.getInteractionRequestSchema = getInteractionRequestSchema;
/**
 * Transforms an interaction request to a format that can be serialized to POLO.
 *
 * @param ix Interaction request
 * @returns a raw interaction request
 */
const transformInteraction = (ix) => {
    return {
        ...ix,
        sender: { ...ix.sender, id: new js_moi_identifiers_1.ParticipantId(ix.sender.id).toBytes() },
        sponsor: ix.sponsor ? { ...ix.sponsor, id: new js_moi_identifiers_1.ParticipantId(ix.sponsor.id).toBytes() } : { id: (0, hex_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS), key_id: 0, sequence: 0 },
        ix_operations: ix.operations.map(operations_1.encodeOperation),
        participants: ix.participants?.map((participant) => ({ ...participant, id: (0, hex_1.hexToBytes)(participant.id) })),
        perception: ix.perception ? (0, hex_1.hexToBytes)(ix.perception) : undefined,
        preferences: ix.preferences ? { ...ix.preferences, compute: (0, hex_1.hexToBytes)(ix.preferences.compute) } : undefined,
    };
};
exports.transformInteraction = transformInteraction;
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
function encodeInteraction(ix) {
    const data = "operations" in ix ? (0, exports.transformInteraction)(ix) : ix;
    const polorizer = new js_polo_1.Polorizer();
    polorizer.polorize(data, (0, exports.getInteractionRequestSchema)());
    return polorizer.bytes();
}
const gatherIxParticipants = (interaction) => {
    const participants = new Map([
        [
            interaction.sender.id,
            {
                id: interaction.sender.id,
                lock_type: enums_1.LockType.MutateLock,
                notary: false,
            },
        ],
    ]);
    if (interaction.sponsor != null) {
        participants.set(interaction.sponsor.id, {
            id: interaction.sponsor.id,
            lock_type: enums_1.LockType.MutateLock,
            notary: false,
        });
    }
    for (const { type, payload } of interaction.operations) {
        switch (type) {
            case enums_1.OpType.ParticipantCreate: {
                participants.set(payload.id, {
                    id: payload.id,
                    lock_type: enums_1.LockType.MutateLock,
                    notary: false,
                });
                break;
            }
            case enums_1.OpType.AssetMint:
            case enums_1.OpType.AssetBurn: {
                const identifier = new js_moi_identifiers_1.AssetId(payload.asset_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: enums_1.LockType.MutateLock,
                    notary: false,
                });
                break;
            }
            case enums_1.OpType.AssetTransfer:
            case enums_1.OpType.AssetApprove:
            case enums_1.OpType.AssetRevoke:
            case enums_1.OpType.AssetLockup:
            case enums_1.OpType.AssetRelease: {
                participants.set(payload.beneficiary, {
                    id: payload.beneficiary,
                    lock_type: enums_1.LockType.MutateLock,
                    notary: false,
                });
                if ("benefactor" in payload && payload.benefactor != null) {
                    participants.set(payload.benefactor, {
                        id: payload.benefactor,
                        lock_type: enums_1.LockType.MutateLock,
                        notary: false,
                    });
                }
                break;
            }
            case enums_1.OpType.LogicInvoke:
            case enums_1.OpType.LogicEnlist: {
                const identifier = new js_moi_identifiers_1.LogicId(payload.logic_id);
                participants.set(identifier.toHex(), {
                    id: identifier.toHex(),
                    lock_type: enums_1.LockType.MutateLock,
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
/**
 * Creates a POLO bytes from an interaction request.
 *
 * It smartly gathers the participants and funds from the interaction request and then encodes the interaction request.
 *
 * @param ix - The interaction request to encode.
 * @returns A POLO bytes representing the encoded interaction request.
 */
function interaction(ix, format = "polo") {
    const interaction = {
        ...ix,
        participants: gatherIxParticipants(ix),
    };
    switch (format) {
        case "minimal":
            return interaction;
        case "raw":
            return (0, exports.transformInteraction)(interaction);
        case "polo":
            return encodeInteraction(interaction);
        default:
            throw new Error(`Invalid format: ${format}`);
    }
}
const createInvalidResult = (value, field, message) => {
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
function validateIxRequest(type, ix) {
    if (ix.sender == null) {
        return createInvalidResult(ix, "sender", "Sender is required");
    }
    if (!(0, hex_1.isHex)(ix.sender.id, 32)) {
        return createInvalidResult(ix.sender, "id", "Invalid sender address");
    }
    if (ix.fuel_price == null) {
        return createInvalidResult(ix, "fuel_price", "Fuel price is required");
    }
    if (type === "moi.Execute" && ix["fuel_limit"] == null) {
        return createInvalidResult(ix, "fuel_limit", "Fuel limit is required");
    }
    if (ix.fuel_price < 0) {
        return createInvalidResult(ix, "fuel_price", "Fuel price must be greater than or equal to 0");
    }
    if (type === "moi.Execute" && ix["fuel_limit"] < 0) {
        return createInvalidResult(ix, "fuel_limit", "Fuel limit must be greater than or equal to 0");
    }
    if (ix.sponsor != null && !(0, hex_1.isHex)(ix.sender.id, 32)) {
        return createInvalidResult(ix, "sponsor", "Invalid sponser address");
    }
    if (ix.participants != null) {
        if (!Array.isArray(ix.participants)) {
            return createInvalidResult(ix, "participants", "Participants must be an array");
        }
        let error = null;
        for (const participant of ix.participants) {
            if (error != null) {
                return error;
            }
            if (!(0, hex_1.isHex)(participant.id, 32)) {
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
    let error = null;
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
        const result = (0, operations_1.validateOperation)(operation);
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
//# sourceMappingURL=interaction.js.map