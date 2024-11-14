"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockType = exports.OpType = void 0;
/**
 * Enumerates the types of Operations in the system.
 */
var OpType;
(function (OpType) {
    OpType[OpType["INVALID_IX"] = 0] = "INVALID_IX";
    OpType[OpType["PARTICIPANT_CREATE"] = 1] = "PARTICIPANT_CREATE";
    OpType[OpType["ASSET_TRANSFER"] = 2] = "ASSET_TRANSFER";
    OpType[OpType["FUEL_SUPPLY"] = 3] = "FUEL_SUPPLY";
    OpType[OpType["ASSET_CREATE"] = 4] = "ASSET_CREATE";
    OpType[OpType["ASSET_APPROVE"] = 5] = "ASSET_APPROVE";
    OpType[OpType["ASSET_REVOKE"] = 6] = "ASSET_REVOKE";
    OpType[OpType["ASSET_MINT"] = 7] = "ASSET_MINT";
    OpType[OpType["ASSET_BURN"] = 8] = "ASSET_BURN";
    OpType[OpType["LOGIC_DEPLOY"] = 9] = "LOGIC_DEPLOY";
    OpType[OpType["LOGIC_INVOKE"] = 10] = "LOGIC_INVOKE";
    OpType[OpType["LOGIC_ENLIST"] = 11] = "LOGIC_ENLIST";
    OpType[OpType["LOGIC_INTERACT"] = 12] = "LOGIC_INTERACT";
    OpType[OpType["LOGIC_UPGRADE"] = 13] = "LOGIC_UPGRADE";
    OpType[OpType["FILE_CREATE"] = 14] = "FILE_CREATE";
    OpType[OpType["FILE_UPDATE"] = 15] = "FILE_UPDATE";
    OpType[OpType["PARTICIPANT_REGISTER"] = 16] = "PARTICIPANT_REGISTER";
    OpType[OpType["VALIDATOR_REGISTER"] = 17] = "VALIDATOR_REGISTER";
    OpType[OpType["VALIDATOR_UNREGISTER"] = 18] = "VALIDATOR_UNREGISTER";
    OpType[OpType["STAKE_BOND"] = 19] = "STAKE_BOND";
    OpType[OpType["STAKE_UNBOND"] = 20] = "STAKE_UNBOND";
    OpType[OpType["STAKE_TRANSFER"] = 21] = "STAKE_TRANSFER";
})(OpType || (exports.OpType = OpType = {}));
/**
 * Enumerates the types of particpant locks in the system.
 */
var LockType;
(function (LockType) {
    LockType[LockType["MUTATE_LOCK"] = 0] = "MUTATE_LOCK";
    LockType[LockType["READ_LOCK"] = 1] = "READ_LOCK";
    LockType[LockType["NO_LOCK"] = 2] = "NO_LOCK";
})(LockType || (exports.LockType = LockType = {}));
//# sourceMappingURL=interaction.js.map