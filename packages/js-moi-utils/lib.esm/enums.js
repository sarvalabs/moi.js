/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export var AssetStandard;
(function (AssetStandard) {
    AssetStandard[AssetStandard["MAS0"] = 0] = "MAS0";
    AssetStandard[AssetStandard["MAS1"] = 1] = "MAS1";
})(AssetStandard || (AssetStandard = {}));
/**
 * Enumerates the types of Operations in the system.
 */
export var OpType;
(function (OpType) {
    OpType[OpType["ParticipantCreate"] = 1] = "ParticipantCreate";
    OpType[OpType["AccountConfigure"] = 2] = "AccountConfigure";
    OpType[OpType["AssetTransfer"] = 3] = "AssetTransfer";
    OpType[OpType["AssetCreate"] = 5] = "AssetCreate";
    OpType[OpType["AssetApprove"] = 6] = "AssetApprove";
    OpType[OpType["AssetRevoke"] = 7] = "AssetRevoke";
    OpType[OpType["AssetMint"] = 8] = "AssetMint";
    OpType[OpType["AssetBurn"] = 9] = "AssetBurn";
    OpType[OpType["AssetLockup"] = 10] = "AssetLockup";
    OpType[OpType["AssetRelease"] = 11] = "AssetRelease";
    OpType[OpType["LogicDeploy"] = 12] = "LogicDeploy";
    OpType[OpType["LogicInvoke"] = 13] = "LogicInvoke";
    OpType[OpType["LogicEnlist"] = 14] = "LogicEnlist";
})(OpType || (OpType = {}));
/**
 * Enumerates the types of participant locks in the system.
 */
export var LockType;
(function (LockType) {
    LockType[LockType["MutateLock"] = 0] = "MutateLock";
    LockType[LockType["ReadLock"] = 1] = "ReadLock";
    LockType[LockType["NoLock"] = 2] = "NoLock";
})(LockType || (LockType = {}));
/**
 * Enumerates the types of participant keys in the system.
 */
export var AccountType;
(function (AccountType) {
    AccountType[AccountType["SargaAccount"] = 0] = "SargaAccount";
    AccountType[AccountType["LogicAccount"] = 2] = "LogicAccount";
    AccountType[AccountType["AssetAccount"] = 3] = "AssetAccount";
    AccountType[AccountType["RegularAccount"] = 4] = "RegularAccount";
})(AccountType || (AccountType = {}));
export var ReceiptStatus;
(function (ReceiptStatus) {
    ReceiptStatus[ReceiptStatus["Ok"] = 0] = "Ok";
    ReceiptStatus[ReceiptStatus["StateReverted"] = 1] = "StateReverted";
    ReceiptStatus[ReceiptStatus["InsufficientFuel"] = 2] = "InsufficientFuel";
})(ReceiptStatus || (ReceiptStatus = {}));
export var OperationStatus;
(function (OperationStatus) {
    OperationStatus[OperationStatus["Ok"] = 0] = "Ok";
    OperationStatus[OperationStatus["ExceptionRaised"] = 1] = "ExceptionRaised";
    OperationStatus[OperationStatus["StateReverted"] = 2] = "StateReverted";
    OperationStatus[OperationStatus["FuelExhausted"] = 3] = "FuelExhausted";
})(OperationStatus || (OperationStatus = {}));
export var EngineKind;
(function (EngineKind) {
    EngineKind["PISA"] = "PISA";
    EngineKind["MERU"] = "MERU";
})(EngineKind || (EngineKind = {}));
export var LogicState;
(function (LogicState) {
    LogicState["Persistent"] = "persistent";
    LogicState["Ephemeral"] = "ephemeral";
})(LogicState || (LogicState = {}));
export var RoutineKind;
(function (RoutineKind) {
    RoutineKind["Persistent"] = "persistent";
    RoutineKind["Ephemeral"] = "ephemeral";
    RoutineKind["ReadOnly"] = "readonly";
})(RoutineKind || (RoutineKind = {}));
export var RoutineType;
(function (RoutineType) {
    RoutineType["Invoke"] = "invoke";
    RoutineType["Deploy"] = "deploy";
    RoutineType["Enlist"] = "enlist";
})(RoutineType || (RoutineType = {}));
export var ElementType;
(function (ElementType) {
    ElementType["Constant"] = "constant";
    ElementType["Typedef"] = "typedef";
    ElementType["Class"] = "class";
    ElementType["State"] = "state";
    ElementType["Routine"] = "routine";
    ElementType["Method"] = "method";
    ElementType["Event"] = "event";
})(ElementType || (ElementType = {}));
export var InteractionStatus;
(function (InteractionStatus) {
    InteractionStatus[InteractionStatus["Pending"] = 0] = "Pending";
    InteractionStatus[InteractionStatus["Finalized"] = 1] = "Finalized";
})(InteractionStatus || (InteractionStatus = {}));
//# sourceMappingURL=enums.js.map