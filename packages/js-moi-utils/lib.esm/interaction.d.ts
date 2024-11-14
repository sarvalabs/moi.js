/**
 * Enumerates the types of Operations in the system.
 */
export declare enum OpType {
    INVALID_IX = 0,
    PARTICIPANT_CREATE = 1,
    ASSET_TRANSFER = 2,
    FUEL_SUPPLY = 3,
    ASSET_CREATE = 4,
    ASSET_APPROVE = 5,
    ASSET_REVOKE = 6,
    ASSET_MINT = 7,
    ASSET_BURN = 8,
    LOGIC_DEPLOY = 9,
    LOGIC_INVOKE = 10,
    LOGIC_ENLIST = 11,
    LOGIC_INTERACT = 12,
    LOGIC_UPGRADE = 13,
    FILE_CREATE = 14,
    FILE_UPDATE = 15,
    PARTICIPANT_REGISTER = 16,
    VALIDATOR_REGISTER = 17,
    VALIDATOR_UNREGISTER = 18,
    STAKE_BOND = 19,
    STAKE_UNBOND = 20,
    STAKE_TRANSFER = 21
}
/**
 * Enumerates the types of particpant locks in the system.
 */
export declare enum LockType {
    MUTATE_LOCK = 0,
    READ_LOCK = 1,
    NO_LOCK = 2
}
//# sourceMappingURL=interaction.d.ts.map