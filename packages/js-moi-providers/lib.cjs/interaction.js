"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIxObject = exports.serializePayload = exports.validateLogicPayload = exports.validateLogicDeployPayload = exports.validateAssetTransferPayload = exports.validateAssetSupplyPayload = exports.validateAssetCreatePayload = exports.validateParticipantCreatePayload = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const js_moi_constants_1 = require("js-moi-constants");
/**
 * Validates the payload for PARTICIPANT_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateParticipantCreatePayload = (payload) => {
    if ('address' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid participant create payload");
};
exports.validateParticipantCreatePayload = validateParticipantCreatePayload;
/**
 * Validates the payload for ASSET_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetCreatePayload = (payload) => {
    if ('symbol' in payload && 'supply' in payload && 'standard' in payload) {
        return payload;
    }
    throw new Error("Invalid asset create payload");
};
exports.validateAssetCreatePayload = validateAssetCreatePayload;
/**
 * Validates the payload for ASSET_MINT and ASSET_BURN operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetSupplyPayload = (payload) => {
    if ('asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid asset mint or burn payload");
};
exports.validateAssetSupplyPayload = validateAssetSupplyPayload;
/**
 * Validates the payload for ASSET_TRANSFER operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateAssetTransferPayload = (payload) => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload;
    }
    throw new Error("Invalid asset transfer payload");
};
exports.validateAssetTransferPayload = validateAssetTransferPayload;
/**
 * Validates the payload for LOGIC_DEPLOY operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateLogicDeployPayload = (payload) => {
    if ('manifest' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid logic deploy payload");
};
exports.validateLogicDeployPayload = validateLogicDeployPayload;
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
const validateLogicPayload = (payload) => {
    if ('logic_id' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload;
    }
    throw new Error("Invalid logic invoke or enlist payload");
};
exports.validateLogicPayload = validateLogicPayload;
/**
 * Processes the payload based on the operation type.
 *
 * @param {OpType} txType - The operation type.
 * @param {OperationPayload} payload - The operation payload.
 * @returns {OperationPayload} - The processed operation payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
const processPayload = (txType, payload) => {
    switch (txType) {
        case js_moi_utils_1.OpType.PARTICIPANT_CREATE: {
            const participantPayload = (0, exports.validateParticipantCreatePayload)(payload);
            return {
                ...participantPayload,
                address: (0, js_moi_utils_1.hexToBytes)(participantPayload.address),
            };
        }
        case js_moi_utils_1.OpType.ASSET_CREATE: {
            const createPayload = (0, exports.validateAssetCreatePayload)(payload);
            return { ...createPayload };
        }
        case js_moi_utils_1.OpType.ASSET_MINT:
        case js_moi_utils_1.OpType.ASSET_BURN: {
            const supplyPayload = (0, exports.validateAssetSupplyPayload)(payload);
            return {
                ...supplyPayload,
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(supplyPayload.asset_id),
            };
        }
        case js_moi_utils_1.OpType.ASSET_TRANSFER: {
            const actionPayload = (0, exports.validateAssetTransferPayload)(payload);
            return {
                ...actionPayload,
                benefactor: (0, js_moi_utils_1.hexToBytes)(actionPayload.benefactor ?? js_moi_constants_1.ZERO_ADDRESS),
                beneficiary: (0, js_moi_utils_1.hexToBytes)(actionPayload.beneficiary),
                asset_id: (0, js_moi_utils_1.trimHexPrefix)(actionPayload.asset_id),
            };
        }
        case js_moi_utils_1.OpType.LOGIC_DEPLOY: {
            const logicPayload = (0, exports.validateLogicDeployPayload)(payload);
            return {
                manifest: (0, js_moi_utils_1.hexToBytes)(logicPayload.manifest),
                callsite: logicPayload.callsite,
                calldata: (0, js_moi_utils_1.hexToBytes)(logicPayload.calldata),
            };
        }
        case js_moi_utils_1.OpType.LOGIC_INVOKE:
        case js_moi_utils_1.OpType.LOGIC_ENLIST: {
            const logicPayload = (0, exports.validateLogicPayload)(payload);
            return {
                logic_id: (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: (0, js_moi_utils_1.hexToBytes)(logicPayload.calldata),
            };
        }
        default:
            js_moi_utils_1.ErrorUtils.throwError(`Unsupported operation type: ${txType}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
};
/**
 * Serializes the payload of a operation based on its type.
 * This function polorizes (serializes) the payload using the appropriate schema
 * based on the operation type and returns it as a byte array.
 *
 * @param {OpType} txType - The type of the operation (e.g., ASSET_TRANSFER, ASSET_CREATE).
 * @param {OperationPayload} payload - The payload of the operation to be serialized.
 * @returns {Uint8Array} - A serialized byte array representing the processed payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
const serializePayload = (txType, payload) => {
    const polorizer = new js_polo_1.Polorizer();
    const processedPayload = processPayload(txType, payload);
    switch (txType) {
        case js_moi_utils_1.OpType.PARTICIPANT_CREATE:
            polorizer.polorize(processedPayload, js_moi_utils_1.participantCreateSchema);
            return polorizer.bytes();
        case js_moi_utils_1.OpType.ASSET_TRANSFER:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetActionSchema);
            return polorizer.bytes();
        case js_moi_utils_1.OpType.ASSET_CREATE:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetCreateSchema);
            return polorizer.bytes();
        case js_moi_utils_1.OpType.ASSET_MINT:
        case js_moi_utils_1.OpType.ASSET_BURN:
            polorizer.polorize(processedPayload, js_moi_utils_1.assetSupplySchema);
            return polorizer.bytes();
        case js_moi_utils_1.OpType.LOGIC_DEPLOY:
        case js_moi_utils_1.OpType.LOGIC_INVOKE:
        case js_moi_utils_1.OpType.LOGIC_ENLIST:
            polorizer.polorize(processedPayload, js_moi_utils_1.logicSchema);
            return polorizer.bytes();
        default:
            js_moi_utils_1.ErrorUtils.throwError(`Unsupported operation type: ${txType}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
};
exports.serializePayload = serializePayload;
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
            case js_moi_utils_1.OpType.ASSET_MINT:
            case js_moi_utils_1.OpType.ASSET_BURN: {
                const payload = operation.payload;
                const amount = assetFunds.get(payload.asset_id) ?? 0;
                if (typeof payload.amount === "bigint" || typeof amount === "bigint") {
                    assetFunds.set(payload.asset_id, (0, js_moi_utils_1.toQuantity)(BigInt(payload.amount) + BigInt(amount)));
                    return;
                }
                assetFunds.set(payload.asset_id, (0, js_moi_utils_1.toQuantity)(Number(payload.amount) + Number(amount)));
            }
        }
    });
    if (ixObject.funds != null) {
        // Add additional asset funds to the list if not present
        ixObject.funds.forEach(assetFund => {
            if (!assetFunds.has(assetFund.asset_id)) {
                assetFunds.set(assetFund.asset_id, (0, js_moi_utils_1.toQuantity)(assetFund.amount));
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
 * @returns {IxParticipant[]} - The array of processed participants.
 * @throws {Error} - Throws an error if an unsupported operation type is encountered.
 */
const processParticipants = (ixObject) => {
    const participants = new Map();
    // Add sender to participants
    participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.sender), {
        address: ixObject.sender,
        lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
    });
    // Add payer if it exists
    if (ixObject.payer != null) {
        participants.set((0, js_moi_utils_1.trimHexPrefix)(ixObject.payer), {
            address: ixObject.payer,
            lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
        });
    }
    // Process ix_operations and add participants
    ixObject.ix_operations.forEach((operation) => {
        switch (operation.type) {
            case js_moi_utils_1.OpType.PARTICIPANT_CREATE: {
                const participantCreatePayload = operation.payload;
                participants.set(participantCreatePayload.address, {
                    address: participantCreatePayload.address,
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.ASSET_CREATE:
                break;
            case js_moi_utils_1.OpType.ASSET_MINT:
            case js_moi_utils_1.OpType.ASSET_BURN: {
                const assetSupplyPayload = operation.payload;
                const address = "0x" + (0, js_moi_utils_1.trimHexPrefix)(assetSupplyPayload.asset_id).slice(8);
                participants.set(address, {
                    address: address,
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.ASSET_TRANSFER: {
                const assetActionPayload = operation.payload;
                participants.set(assetActionPayload.beneficiary, {
                    address: assetActionPayload.beneficiary,
                    lock_type: js_moi_utils_1.LockType.MUTATE_LOCK
                });
                break;
            }
            case js_moi_utils_1.OpType.LOGIC_DEPLOY:
                break;
            case js_moi_utils_1.OpType.LOGIC_ENLIST:
            case js_moi_utils_1.OpType.LOGIC_INVOKE: {
                const logicPayload = operation.payload;
                const address = "0x" + (0, js_moi_utils_1.trimHexPrefix)(logicPayload.logic_id).slice(6);
                participants.set(address, {
                    address: address,
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
                    address: participant.address,
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
        const payload = (0, exports.serializePayload)(operation.type, operation.payload);
        return { ...operation, payload: "0x" + (0, js_moi_utils_1.bytesToHex)(payload) };
    });
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedCallorEstimateIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        return {
            nonce: (0, js_moi_utils_1.toQuantity)(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_price),
            fuel_limit: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_limit),
            funds: processFunds(ixObject),
            ix_operations: processOperations(ixObject.ix_operations),
            participants: processParticipants(ixObject)
        };
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.processIxObject = processIxObject;
//# sourceMappingURL=interaction.js.map