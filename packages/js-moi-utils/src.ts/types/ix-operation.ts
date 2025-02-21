import type { AssetStandard, OpType } from "../enums";
import type { Address, Hex } from "../hex";

export interface PoloLogicPayload {
    manifest: Uint8Array;
    logic_id: Hex;
    callsite: string;
    calldata?: Uint8Array;
    interfaces?: Map<string, Hex>;
}

export interface LogicPayload {
    /**
     * The manifest of the logic contract.
     *
     * It is required for `LogicDeploy` operations.
     */
    manifest: Hex;
    /**
     * The unique identifier of the logic.
     *
     * It is required for `LogicDeploy` and `LogicEnlist` operations.
     */
    logic_id: Hex;
    /**
     * The callsite name of the logic contract.
     *
     * It is required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    callsite: string;
    /**
     * The calldata of the logic contract.
     *
     * It may be required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    calldata?: Hex;
    /**
     * The interfaces satisfied the foreign logic.
     *
     * It may be required for `LogicInvoke`, `LogicEnlist` and `LogicDeploy` operations.
     */
    interfaces?: Record<string, Hex>;
}

/**
 * `AssetCreatePayload` holds the data for creating a new asset
 */
export interface AssetCreatePayload {
    /**
     * The name of the asset.
     */
    symbol: string;
    /**
     * The total supply of the asset.
     */
    supply: number;
    /**
     * The standard of the asset.
     */
    standard: AssetStandard;
    /**
     * The dimension of the asset.
     */
    dimension?: number;
    /**
     * The stateful flag of the asset.
     */
    is_stateful?: boolean;
    /**
     * The logical flag of the asset.
     */
    is_logical?: boolean;
    /**
     * The logic of the asset.
     */
    logic_code?: LogicPayload;
}

export interface KeyAddPayload {
    public_key: string;
    weight: number;
    signature_algorithm: 0;
}

export interface PoloParticipantCreatePayload {
    id: Uint8Array;
    amount: number;
    keys_payload: (Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array })[];
}

/**
 * `ParticipantCreatePayload` holds the data for creating a new participant account
 */
export interface ParticipantCreatePayload {
    /**
     * The `address` of the participant that is used to create a participant in network.
     */
    id: Address;
    /**
     * The amount that is provided to newly created address.
     *
     * Note: It should be more or equal to zero.
     */
    amount: number;
    /**
     * The keys_payload is used to specify the keys for the participant.
     */
    keys_payload: KeyAddPayload[];
}

export interface PoloAssetActionPayload {
    asset_id: Hex;
    beneficiary: Uint8Array;
    benefactor: Uint8Array;
    amount: number;
    timestamp: number;
}

/**
 * `AssetActionPayload` holds data for transferring, approving, or revoking an asset.
 */
export interface AssetActionPayload {
    /**
     * The asset id that is used to transfer, approve, or revoke an asset.
     */
    asset_id: Hex;
    /**
     * The beneficiary address that is recipient address that is used to transfer, approve, or revoke an asset.
     */
    beneficiary: Address;
    /**
     * The benefactor is the address that authorized access to his asset funds.
     */
    benefactor: Address;
    /**
     * The amount is used to specify the amount for transfer/approve/revoke
     */
    amount: number;
    /**
     * Timestamp is used to specify the validity of the mandate.
     */
    timestamp: number;
}

export type AssetTransferPayload = Omit<AssetActionPayload, "timestamp" | "benefactor"> & Partial<Pick<AssetActionPayload, "benefactor">>;
export type PoloAssetTransferPayload = Omit<PoloAssetActionPayload, "timestamp" | "benefactor"> & Partial<Pick<PoloAssetActionPayload, "benefactor">>;

export type AssetApprovePayload = Pick<AssetActionPayload, "beneficiary" | "asset_id" | "amount" | "timestamp">;
export type PoloAssetApprovePayload = Pick<PoloAssetActionPayload, "beneficiary" | "asset_id" | "amount" | "timestamp">;

export type AssetRevokePayload = Pick<AssetActionPayload, "beneficiary" | "asset_id">;
export type PoloAssetRevokePayload = Pick<PoloAssetActionPayload, "beneficiary" | "asset_id">;

export type AssetLockupPayload = Pick<AssetActionPayload, "beneficiary" | "asset_id" | "amount">;
export type PoloAssetLockupPayload = Pick<PoloAssetActionPayload, "beneficiary" | "asset_id" | "amount">;

export type AssetReleasePayload = Omit<AssetActionPayload, "timestamp">;
export type PoloAssetReleasePayload = Omit<PoloAssetActionPayload, "timestamp">;

export interface AssetSupplyPayload {
    /**
     * The asset id that is used to mint or burn an asset.
     */
    asset_id: Hex;
    /**
     * The amount that is used to mint or burn an asset.
     */
    amount: number;
}

export interface PoloLogicDeployPayload extends Omit<PoloLogicPayload, "logic_id"> {}

/**
 * `LogicDeployPayload` holds the data for deploying a new logic.
 */
export interface LogicDeployPayload extends Omit<LogicPayload, "logic_id"> {}

export interface PoloLogicActionPayload extends Omit<PoloLogicPayload, "manifest"> {}

/**
 * `LogicActionPayload` holds the data for invoking or enlisting a logic.
 */
export interface LogicActionPayload extends Omit<LogicPayload, "manifest"> {}

export interface KeyRevokePayload {
    key_id: number;
}

export interface AccountConfigurePayload {
    add?: Partial<KeyAddPayload>[];
    revoke?: KeyRevokePayload[];
}

export interface PoloAccountConfigurePayload {
    add?: Partial<Omit<KeyAddPayload, "public_key"> & { public_key: Uint8Array }>[];
    revoke?: KeyRevokePayload[];
}

export interface PoloAssetSupplyPayload {
    asset_id: Uint8Array;
    amount: number;
}

/**
 * `OperationPayload` is a type that holds the payload of an operation.
 *
 * @usage
 * ```typescript
 *  const operation: Operation<OpType.AssetCreate> = { ... }
 * ```
 */
export type IxOperationPayload<T extends OpType> = T extends OpType.ParticipantCreate
    ? ParticipantCreatePayload
    : T extends OpType.AssetCreate
    ? AssetCreatePayload
    : T extends OpType.AssetBurn | OpType.AssetMint
    ? AssetSupplyPayload
    : T extends OpType.AssetTransfer
    ? AssetTransferPayload
    : T extends OpType.AssetApprove
    ? AssetApprovePayload
    : T extends OpType.AssetRelease
    ? AssetReleasePayload
    : T extends OpType.AssetRevoke
    ? AssetRevokePayload
    : T extends OpType.AssetLockup
    ? AssetLockupPayload
    : T extends OpType.LogicDeploy
    ? LogicDeployPayload
    : T extends OpType.LogicInvoke | OpType.LogicEnlist
    ? LogicActionPayload
    : T extends OpType.AccountConfigure
    ? AccountConfigurePayload
    : never;

export type PoloIxOperationPayload<T extends OpType> = T extends OpType.ParticipantCreate
    ? PoloParticipantCreatePayload
    : T extends OpType.AssetCreate
    ? AssetCreatePayload
    : T extends OpType.AssetBurn | OpType.AssetMint
    ? PoloAssetSupplyPayload
    : T extends OpType.AssetTransfer
    ? PoloAssetTransferPayload
    : T extends OpType.AssetApprove
    ? PoloAssetApprovePayload
    : T extends OpType.AssetRelease
    ? PoloAssetReleasePayload
    : T extends OpType.AssetRevoke
    ? PoloAssetRevokePayload
    : T extends OpType.AssetLockup
    ? PoloAssetLockupPayload
    : T extends OpType.LogicDeploy
    ? PoloLogicDeployPayload
    : T extends OpType.LogicInvoke | OpType.LogicEnlist
    ? PoloLogicActionPayload
    : T extends OpType.AccountConfigure
    ? PoloAccountConfigurePayload
    : never;

/**
 * `IxRawOperation` is a type that holds the raw operation data.
 */
export interface IxRawOperation {
    /**
     * The type of the operation.
     */
    type: OpType;
    /**
     * The POLO serialized payload of the operation.
     */
    payload: Uint8Array;
}

export interface IxOperation<TOpType extends OpType> {
    /**
     * The type of the operation.
     */
    type: TOpType;
    /**
     * The payload of the operation.
     */
    payload: IxOperationPayload<TOpType>;
}

/**
 * `AnyIxOperation` is a union type that holds all the operations.
 */
export type AnyIxOperation =
    | IxOperation<OpType.AssetBurn>
    | IxOperation<OpType.AssetCreate>
    | IxOperation<OpType.AssetMint>
    | IxOperation<OpType.AssetTransfer>
    | IxOperation<OpType.AssetApprove>
    | IxOperation<OpType.AssetRelease>
    | IxOperation<OpType.AssetRevoke>
    | IxOperation<OpType.AssetLockup>
    | IxOperation<OpType.LogicDeploy>
    | IxOperation<OpType.LogicEnlist>
    | IxOperation<OpType.LogicInvoke>
    | IxOperation<OpType.ParticipantCreate>
    | IxOperation<OpType.AccountConfigure>;
