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
    Invalid = 0,
    ParticipantCreate = 1,
    AccountConfigure = 2,
    AssetTransfer = 3,
    FuelSupply = 4,// TODO: Remove this
    AssetCreate = 5,
    AssetApprove = 6,
    AssetRevoke = 7,
    AssetMint = 8,
    AssetBurn = 9,
    AssetLockup = 10,
    AssetRelease = 11,
    LogicDeploy = 12,
    LogicInvoke = 13,
    LogicEnlist = 14,
    LogicInteract = 15,
    LogicUpgrade = 16
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
export declare enum RoutineType {
    Invoke = "invoke",
    Deploy = "deploy"
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
//# sourceMappingURL=enums.d.ts.map