"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processIxObject = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const js_polo_1 = require("js-polo");
const serializePayload = (ixType, payload) => {
    let polorizer = new js_polo_1.Polorizer();
    switch (ixType) {
        case js_moi_utils_1.TxType.ASSET_CREATE:
            polorizer.polorize(payload, js_moi_utils_1.assetCreateSchema);
            return polorizer.bytes();
        case js_moi_utils_1.TxType.ASSET_MINT:
        case js_moi_utils_1.TxType.ASSET_BURN:
            polorizer.polorize(payload, js_moi_utils_1.assetMintOrBurnSchema);
            return polorizer.bytes();
        case js_moi_utils_1.TxType.LOGIC_DEPLOY:
        case js_moi_utils_1.TxType.LOGIC_INVOKE:
        case js_moi_utils_1.TxType.LOGIC_ENLIST:
            polorizer.polorize(payload, js_moi_utils_1.logicSchema);
            return polorizer.bytes();
        default:
            js_moi_utils_1.ErrorUtils.throwError("Failed to serialize payload", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
    }
};
const createParticipants = (transactions) => {
    return transactions.map(transaction => {
        switch (transaction.type) {
            case js_moi_utils_1.TxType.ASSET_CREATE:
                return null;
            case js_moi_utils_1.TxType.ASSET_MINT:
            case js_moi_utils_1.TxType.ASSET_BURN:
                return {
                    address: transaction.payload.asset_id.slice(6),
                    lock_type: 1,
                };
            case js_moi_utils_1.TxType.VALUE_TRANSFER:
                return {
                    address: transaction.payload.beneficiary,
                    lock_type: 1,
                };
            case js_moi_utils_1.TxType.LOGIC_DEPLOY:
                return null;
            case js_moi_utils_1.TxType.LOGIC_ENLIST:
            case js_moi_utils_1.TxType.LOGIC_INVOKE:
                return {
                    address: transaction.payload.logic_id.slice(6),
                    lock_type: 1
                };
            default:
                js_moi_utils_1.ErrorUtils.throwError("Unsupported Ix type", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
        }
    }).filter(step => step != null);
};
/**
 * Processes the interaction object based on its type and returns the processed object.
 *
 * @param {CallorEstimateIxObject} ixObject - The interaction object to be processed.
 * @returns {ProcessedIxObject} - The processed interaction object.
 * @throws {Error} - Throws an error if the interaction type is unsupported or if there is a missing payload.
 */
const processIxObject = (ixObject) => {
    try {
        const processedIxObject = {
            nonce: (0, js_moi_utils_1.toQuantity)(ixObject.nonce),
            sender: ixObject.sender,
            fuel_price: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_price),
            fuel_limit: (0, js_moi_utils_1.toQuantity)(ixObject.fuel_limit),
            asset_funds: ixObject.asset_funds,
            transactions: [],
            participants: [
                {
                    address: ixObject.sender,
                    lock_type: 1,
                },
                ...createParticipants(ixObject.transactions)
            ],
        };
        processedIxObject.transactions = ixObject.transactions.map(step => ({
            ...step,
            payload: "0x" + (0, js_moi_utils_1.bytesToHex)(serializePayload(step.type, step.payload)),
        }));
        return processedIxObject;
    }
    catch (err) {
        js_moi_utils_1.ErrorUtils.throwError("Failed to process interaction object", js_moi_utils_1.ErrorCode.UNKNOWN_ERROR, { originalError: err });
    }
};
exports.processIxObject = processIxObject;
//# sourceMappingURL=interaction.js.map