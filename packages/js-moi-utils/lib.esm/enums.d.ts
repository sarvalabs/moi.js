/**
 * Enumerates the standard of assets in the system.
 * MAS is moi asset standard.
 */
export declare enum AssetStandard {
    MAS0 = 0,
    MAS1 = 1
}
/**
 * Enumerates the types of Operations in the system.
 */
export declare enum OpType {
    ParticipantCreate = 1,
    AccountConfigure = 2,
    AssetTransfer = 3,
    AssetCreate = 5,
    AssetApprove = 6,
    AssetRevoke = 7,
    AssetMint = 8,
    AssetBurn = 9,
    AssetLockup = 10,
    AssetRelease = 11,
    LogicDeploy = 12,
    LogicInvoke = 13,
    LogicEnlist = 14
}
/**
 * Enumerates the types of participant locks in the system.
 */
export declare enum LockType {
    MutateLock = 0,
    ReadLock = 1,
    NoLock = 2
}
/**
 * Enumerates the types of participant keys in the system.
 */
export declare enum AccountType {
    SargaAccount = 0,
    LogicAccount = 2,
    AssetAccount = 3,
    RegularAccount = 4
}
export declare enum ReceiptStatus {
    Ok = 0,
    StateReverted = 1,
    InsufficientFuel = 2
}
export declare enum OperationStatus {
    Ok = 0,
    ExceptionRaised = 1,
    StateReverted = 2,
    FuelExhausted = 3
}
export declare enum EngineKind {
    PISA = "PISA",
    MERU = "MERU"
}
export declare enum LogicState {
    Persistent = "persistent",
    Ephemeral = "ephemeral"
}
export declare enum RoutineKind {
    Persistent = "persistent",
    Ephemeral = "ephemeral",
    ReadOnly = "readonly"
}
export declare enum RoutineType {
    Invoke = "invoke",
    Deploy = "deploy",
    Enlist = "enlist"
}
export declare enum ElementType {
    Constant = "constant",
    Typedef = "typedef",
    Class = "class",
    State = "state",
    Routine = "routine",
    Method = "method",
    Event = "event"
}
export declare enum InteractionStatus {
    Pending = 0,
    Finalized = 1
}
//# sourceMappingURL=enums.d.ts.map