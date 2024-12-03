"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_moi_providers_1 = require("js-moi-providers");
const js_moi_constants_1 = require("js-moi-constants");
const js_polo_1 = require("js-polo");
/**
 * Processes the interaction object to extract and consolidate asset funds from
 * ix_operations and asset funds.
 *
 * @param {InteractionObject} ixObject - The interaction object containing ix_operations and asset funds.
 * @returns {ProcessedIxAssetFund[]} - The consolidated list of processed asset funds.
 */
const processFunds = (ixObject) => {
    const assetFunds = new Map();
    ixObject.ix_operations.forEach(operation => {
        switch (operation.type) {
            case js_moi_utils_1.OpType.ASSET_TRANSFER:
            case js_moi_utils_1.OpType.ASSET_BURN: {
                const payload = operation.payload;
                const amount = assetFunds.get(payload.asset_id) ?? 0;
                if (typeof payload.amount === "bigint" || typeof amount === "bigint") {
                    assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(payload.asset_id), BigInt(payload.amount) + BigInt(amount));
                    return;
                }
                assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(payload.asset_id), Number(payload.amount) + Number(amount));
            }
        }
    });
    if (ixObject.funds != null) {
        // Add additional asset funds to the list if not present
        ixObject.funds.forEach(assetFund => {
            if (!assetFunds.has((0, js_moi_utils_1.trimHexPrefix)(assetFund.asset_id))) {
                assetFunds.set((0, js_moi_utils_1.trimHexPrefix)(assetFund.asset_id), assetFund.amount);
            }
        });
    }
    return Array.from(assetFunds, ([asset_id, amount]) => ({ asset_id, amount }));
};
/**
 * Processes a series of ix_operations and returns an array of processed participants.
 * Each participant is derived based on the type of operation and its associated payload.
 *
 * @param {IxOperation[]} steps - The array of operation steps to process.
 * @returns {ProcessedIxParticipant[]} - The array of processed participants.
 * @throws {Error} - Throws an error if an unsupported operation type is encountered.
 */
const processParticipants = (ixObject) => {
    const participants = new Map();
    // Add sender to participants
    participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.sender), {
        address: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
        lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
    });
    // Add payer if it exists
    if (ixObject.payer != null) {
        participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.payer), {
            address: (0, js_moi_utils_1.hexToBytes)(ixObject.payer),
            lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
        });
    }
    // Process ix_operations and add participants
    ixObject.ix_operations.forEach((operation) => {
        switch (operation.type) {
            case js_moi_utils_1.OpType.PARTICIPANT_CREATE: {
                const participantCreatePayload = operation.payload;
                participants.set(participantCreatePayload.address, {
                    address: (0, js_moi_utils_1.hexToBytes)(participantCreatePayload.address),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.ASSET_CREATE:
                break;
            case js_moi_utils_1.OpType.ASSET_MINT:
            case js_moi_utils_1.OpType.ASSET_BURN: {
                const assetSupplyPayload = operation.payload;
                const address = (0, js_moi_utils_1.trimHexPrefix)(assetSupplyPayload.asset_id).slice(8);
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(address),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.ASSET_TRANSFER: {
                const assetActionPayload = operation.payload;
                participants.set(assetActionPayload.beneficiary, {
                    address: (0, js_moi_utils_1.hexToBytes)(assetActionPayload.beneficiary),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.LOGIC_DEPLOY:
                break;
            case js_moi_utils_1.OpType.LOGIC_ENLIST:
            case js_moi_utils_1.OpType.LOGIC_INVOKE: {
                const logicPayload = operation.payload;
                const address = (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id).slice(6);
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(address),
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported Ix type", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    });
    // Add additional participants if they exist
    if (ixObject.participants != null) {
        ixObject.participants.forEach((participant) => {
            const address = (0, js_moi_utils_1.trimHexPrefix)(participant.address);
            if (!participants.has(address)) {
                participants.set(address, {
                    address: (0, js_moi_utils_1.hexToBytes)(participant.address),
                    lock_type: participant.lock_type
                });
            }
        });
    }
    return Array.from(participants.values());
};
/**
 * Processes an array of ix_operations by serializing their payloads into byte form
 * and returns the processed ix_operations.
 *
 * @param {IxOperation[]} ix_operations - Operations to process.
 * @returns {ProcessedIxOperation[]} - Processed ix_operations with serialized payloads.
 * @throws {Error} - If the payload is missing or operation type is unsupported.
 */
const processOperations = (ix_operations) => {
    return ix_operations.map(operation => {
        if (!operation.payload) {
            js_moi_utils_1.ErrorUtils.throwError("Payload is missing!", js_moi_utils_1.ErrorCode.MISSING_ARGUMENT);
        }
        const payload = (0, js_moi_providers_1.serializePayload)(operation.type, operation.payload);
        return { ...operation, payload };
    });
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {InteractionObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        return {
            sender: (0, js_moi_utils_1.hexToBytes)(ixObject.sender),
            payer: (0, js_moi_utils_1.hexToBytes)(js_moi_constants_1.ZERO_ADDRESS),
            nonce: ixObject.nonce,
            fuel_price: ixObject.fuel_price,
            fuel_limit: ixObject.fuel_limit,
            funds: processFunds(ixObject),
            ix_operations: processOperations(ixObject.ix_operations),
            participants: processParticipants(ixObject),
        };
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
/**
 * POLO encodes an interaction object into a Uint8Array representation.
 *
 * @param {InteractionObject} ixObject - The interaction object to be encoded.
 * @returns {Uint8Array} The encoded interaction object as a Uint8Array.
 * @throws {Error} if there is an error during encoding or if the payload is missing.
 */
const serializeIxObject = (ixObject) => {
    try {
        const processedIxObject = processIxObject(ixObject);
        const polorizer = new js_polo_1.Polorizer();
        polorizer.polorize(processedIxObject, js_moi_utils_1.ixObjectSchema);
        return polorizer.bytes();
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to serialize interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.serializeIxObject = serializeIxObject;
//# sourceMappingURL=serializer.js.map