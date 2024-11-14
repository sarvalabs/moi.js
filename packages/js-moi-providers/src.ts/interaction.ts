import { ErrorCode, ErrorUtils, OpType, participantCreateSchema, assetActionSchema, assetCreateSchema, assetSupplySchema, bytesToHex, hexToBytes, logicSchema, toQuantity, trimHexPrefix, LockType } from "js-moi-utils";
import { Polorizer } from "js-polo";
import { ZERO_ADDRESS } from "js-moi-constants";
import { AssetActionPayload, AssetCreatePayload, AssetSupplyPayload, CallorEstimateIxObject, LogicPayload, ParticipantCreatePayload, ProcessedOperationPayload, OperationPayload, InteractionObject, IxOperation, ProcessedIxOperation, IxParticipant, ProcessedCallorEstimateIxObject, ProcessedIxAssetFund } from "../types/jsonrpc";

/**
 * Validates the payload for PARTICIPANT_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateParticipantCreatePayload = (payload: OperationPayload): ParticipantCreatePayload => {
    if ('address' in payload && 'amount' in payload) {
        return payload as ParticipantCreatePayload;
    }

    throw new Error("Invalid participant create payload");
};

/**
 * Validates the payload for ASSET_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetCreatePayload = (payload: OperationPayload): AssetCreatePayload => {
    if ('symbol' in payload && 'supply' in payload && 'standard' in payload) {
        return payload as AssetCreatePayload;
    }

    throw new Error("Invalid asset create payload");
};

/**
 * Validates the payload for ASSET_MINT and ASSET_BURN operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetSupplyPayload = (payload: OperationPayload): AssetSupplyPayload => {
    if ('asset_id' in payload && 'amount' in payload) {
        return payload as AssetSupplyPayload;
    }

    throw new Error("Invalid asset mint or burn payload");
};

/**
 * Validates the payload for ASSET_TRANSFER operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateAssetTransferPayload = (payload: OperationPayload): AssetActionPayload => {
    if ('beneficiary' in payload && 'asset_id' in payload && 'amount' in payload) {
        return payload as AssetActionPayload;
    }

    throw new Error("Invalid asset transfer payload");
};

/**
 * Validates the payload for LOGIC_DEPLOY operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicDeployPayload = (payload: OperationPayload): LogicPayload => {
    if ('manifest' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload as LogicPayload;
    }

    throw new Error("Invalid logic deploy payload");
};

/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export const validateLogicPayload = (payload: OperationPayload): LogicPayload => {
    if ('logic_id' in payload && 'callsite' in payload && 'calldata' in payload) {
        return payload as LogicPayload;
    }

    throw new Error("Invalid logic invoke or enlist payload");
};

/**
 * Processes the payload based on the operation type.
 *
 * @param {OpType} txType - The operation type.
 * @param {OperationPayload} payload - The operation payload.
 * @returns {OperationPayload} - The processed operation payload.
 * @throws {Error} - Throws an error if the operation type is unsupported.
 */
const processPayload = (txType: OpType, payload: OperationPayload): ProcessedOperationPayload => {
    switch (txType) {
        case OpType.PARTICIPANT_CREATE: {
            const participantPayload = validateParticipantCreatePayload(payload);

            return {
                ...participantPayload,
                address: hexToBytes(participantPayload.address),
            };
        }

        case OpType.ASSET_CREATE: {
            const createPayload = validateAssetCreatePayload(payload);
            return { ...createPayload };
        }

        case OpType.ASSET_MINT:
        case OpType.ASSET_BURN: {
            const supplyPayload = validateAssetSupplyPayload(payload);
            return {
                ...supplyPayload,
                asset_id: trimHexPrefix(supplyPayload.asset_id),
            };
        }

        case OpType.ASSET_TRANSFER: {
            const actionPayload = validateAssetTransferPayload(payload);
            return {
                ...actionPayload,
                benefactor: hexToBytes(actionPayload.benefactor ?? ZERO_ADDRESS),
                beneficiary: hexToBytes(actionPayload.beneficiary),
                asset_id: trimHexPrefix(actionPayload.asset_id),
            };
        }

        case OpType.LOGIC_DEPLOY: {
            const logicPayload = validateLogicDeployPayload(payload);
            return {
                manifest: hexToBytes(logicPayload.manifest),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }

        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST: {
            const logicPayload = validateLogicPayload(payload);
            return {
                logic_id: trimHexPrefix(logicPayload.logic_id),
                callsite: logicPayload.callsite,
                calldata: hexToBytes(logicPayload.calldata),
            };
        }

        default:
            ErrorUtils.throwError(
                `Unsupported operation type: ${txType}`,
                ErrorCode.UNSUPPORTED_OPERATION
            );
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
export const serializePayload = (txType: OpType, payload: OperationPayload): Uint8Array => {
    const polorizer = new Polorizer()
    const processedPayload = processPayload(txType, payload)
    switch(txType) {
        case OpType.PARTICIPANT_CREATE:
            polorizer.polorize(processedPayload, participantCreateSchema);
            return polorizer.bytes()
        case OpType.ASSET_TRANSFER:
            polorizer.polorize(processedPayload, assetActionSchema);
            return polorizer.bytes()
        case OpType.ASSET_CREATE:
            polorizer.polorize(processedPayload, assetCreateSchema);
            return polorizer.bytes()
        case OpType.ASSET_MINT:
        case OpType.ASSET_BURN:
            polorizer.polorize(processedPayload, assetSupplySchema);
            return polorizer.bytes()
        case OpType.LOGIC_DEPLOY:
        case OpType.LOGIC_INVOKE:
        case OpType.LOGIC_ENLIST:
            polorizer.polorize(processedPayload, logicSchema);
            return polorizer.bytes()
        default:
            ErrorUtils.throwError(
                `Unsupported operation type: ${txType}`, 
                ErrorCode.UNSUPPORTED_OPERATION
            );
    }
}

/**
 * Processes the interaction object to extract and consolidate asset funds from 
 * ix_operations and asset funds.
 *
 * @param {InteractionObject} ixObject - The interaction object containing ix_operations and asset funds.
 * @returns {ProcessedIxAssetFund[]} - The consolidated list of processed asset funds.
 */
const processFunds = (ixObject: InteractionObject): ProcessedIxAssetFund[] => {
    const assetFunds = new Map<string, string>();

    ixObject.ix_operations.forEach(operation => {
        switch(operation.type) {
            case OpType.ASSET_TRANSFER:
            case OpType.ASSET_MINT:
            case OpType.ASSET_BURN: {
                const payload = operation.payload as AssetSupplyPayload | AssetActionPayload;
                const amount = assetFunds.get(payload.asset_id) ?? 0;

                if(typeof payload.amount === "bigint" || typeof amount === "bigint") {
                    assetFunds.set(
                        payload.asset_id, 
                        toQuantity(BigInt(payload.amount) + BigInt(amount))
                    );
                    return;
                }
                
                assetFunds.set(
                    payload.asset_id, 
                    toQuantity(Number(payload.amount) + Number(amount)),
                );
            }
        }
    });

    if(ixObject.funds != null) {
        // Add additional asset funds to the list if not present
        ixObject.funds.forEach(assetFund => {
            if (!assetFunds.has(assetFund.asset_id)) {
                assetFunds.set(assetFund.asset_id, toQuantity(assetFund.amount));
            }
        });
    }

    return Array.from(assetFunds, ([asset_id, amount]) => 
        ({ asset_id, amount })
    ) as ProcessedIxAssetFund[];
}

/**
 * Processes a series of ix_operations and returns an array of processed participants.
 * Each participant is derived based on the type of operation and its associated payload.
 *
 * @param {IxOperation[]} steps - The array of operation steps to process.
 * @returns {IxParticipant[]} - The array of processed participants.
 * @throws {Error} - Throws an error if an unsupported operation type is encountered.
 */
const processParticipants = (ixObject: InteractionObject): IxParticipant[] => {
    const participants = new Map<string, IxParticipant>();

    // Add sender to participants
    participants.set(trimHexPrefix(ixObject.sender), {
        address: ixObject.sender,
        lock_type: LockType.MUTATE_LOCK
    });

    // Add payer if it exists
    if (ixObject.payer != null) {
        participants.set(trimHexPrefix(ixObject.payer), {
            address: ixObject.payer,
            lock_type: LockType.MUTATE_LOCK
        });
    }

    // Process ix_operations and add participants
    ixObject.ix_operations.forEach((operation) => {
        switch (operation.type) {
            case OpType.PARTICIPANT_CREATE: {
                const participantCreatePayload = operation.payload as ParticipantCreatePayload;

                participants.set(participantCreatePayload.address, {
                    address: participantCreatePayload.address,
                    lock_type: LockType.MUTATE_LOCK
                });
                break;
            }
            case OpType.ASSET_CREATE:
                break;
            case OpType.ASSET_MINT:
            case OpType.ASSET_BURN: {
                const assetSupplyPayload = operation.payload as AssetSupplyPayload;
                const address = "0x" + trimHexPrefix(assetSupplyPayload.asset_id).slice(8);

                participants.set(address, {
                    address: address,
                    lock_type: LockType.MUTATE_LOCK
                });
                break;
            }
            case OpType.ASSET_TRANSFER: {
                const assetActionPayload = operation.payload as AssetActionPayload;

                participants.set(assetActionPayload.beneficiary, {
                    address: assetActionPayload.beneficiary,
                    lock_type: LockType.MUTATE_LOCK
                });
                break;
            }
            case OpType.LOGIC_DEPLOY:
                break;
            case OpType.LOGIC_ENLIST:
            case OpType.LOGIC_INVOKE: {
                const logicPayload = operation.payload as LogicPayload;
                const address = "0x" + trimHexPrefix(logicPayload.logic_id).slice(6);

                participants.set(address, {
                    address: address,
                    lock_type: LockType.MUTATE_LOCK
                });
                break;
            }
            default:
                ErrorUtils.throwError("Unsupported Ix type", ErrorCode.INVALID_ARGUMENT);
        }
    });

    // Add additional participants if they exist
    if (ixObject.participants != null) {
        ixObject.participants.forEach((participant) => {
            const address = trimHexPrefix(participant.address);

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
const processOperations = (ix_operations: IxOperation[]): ProcessedIxOperation[] => {
    return ix_operations.map(operation => {
        if(!operation.payload) {
            ErrorUtils.throwError(
                "Payload is missing!",
                ErrorCode.MISSING_ARGUMENT
            )
        }

        const payload = serializePayload(operation.type, operation.payload);

        return {...operation, payload: "0x" + bytesToHex(payload)}
    })
}

/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedCallorEstimateIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export const processIxObject = (ixObject: CallorEstimateIxObject): ProcessedCallorEstimateIxObject => {
    try {
        return { 
            nonce: toQuantity(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: toQuantity(ixObject.fuel_price),
            fuel_limit: toQuantity(ixObject.fuel_limit),
            funds: processFunds(ixObject),
            ix_operations: processOperations(ixObject.ix_operations),
            participants: processParticipants(ixObject)
        };
    } catch(err) {
        ErrorUtils.throwError(
            "Failed to process interaction object",
            ErrorCode.UNKNOWN_ERROR,
            { originalError: err }
        )
    } 
}
