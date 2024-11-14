import { OpType } from "js-moi-utils";
import { AssetActionPayload, AssetCreatePayload, AssetSupplyPayload, CallorEstimateIxObject, LogicPayload, ParticipantCreatePayload, OperationPayload, ProcessedCallorEstimateIxObject } from "../types/jsonrpc";
/**
 * Validates the payload for PARTICIPANT_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateParticipantCreatePayload: (payload: OperationPayload) => ParticipantCreatePayload;
/**
 * Validates the payload for ASSET_CREATE operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetCreatePayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateAssetCreatePayload: (payload: OperationPayload) => AssetCreatePayload;
/**
 * Validates the payload for ASSET_MINT and ASSET_BURN operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetSupplyPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateAssetSupplyPayload: (payload: OperationPayload) => AssetSupplyPayload;
/**
 * Validates the payload for ASSET_TRANSFER operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {AssetActionPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateAssetTransferPayload: (payload: OperationPayload) => AssetActionPayload;
/**
 * Validates the payload for LOGIC_DEPLOY operation type.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateLogicDeployPayload: (payload: OperationPayload) => LogicPayload;
/**
 * Validates the payload for LOGIC_INVOKE and LOGIC_ENLIST operation types.
 *
 * @param {OperationPayload} payload - The operation payload.
 * @returns {LogicPayload} - The validated payload.
 * @throws {Error} - Throws an error if the payload is invalid.
 */
export declare const validateLogicPayload: (payload: OperationPayload) => LogicPayload;
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
export declare const serializePayload: (txType: OpType, payload: OperationPayload) => Uint8Array;
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedCallorEstimateIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
export declare const processIxObject: (ixObject: CallorEstimateIxObject) => ProcessedCallorEstimateIxObject;
//# sourceMappingURL=interaction.d.ts.map