import type { OperationStatus, OpType } from "../../enums";
import type { Hex } from "../../hex";

export interface AssetCreateResult {
    asset_id: Hex;
    address: Hex;
}

export interface LogicResult {
    logic_id: Hex;
    outputs: Hex;
    error: Hex;
}

export type LogicActionResult = Omit<LogicResult, "logic_id">;

export type LogicDeployResult = Pick<LogicResult, "logic_id"> & Pick<LogicResult, "error">;

export type AssetSupplyResult = null;

export type NoOperationResult = null;

export type IxOpResult<TOpType extends OpType> = TOpType extends OpType.AssetCreate
    ? AssetCreateResult
    : TOpType extends OpType.AssetBurn | OpType.AssetMint
    ? AssetSupplyResult
    : TOpType extends OpType.LogicDeploy
    ? LogicDeployResult
    : TOpType extends OpType.LogicInvoke | OpType.LogicEnlist
    ? LogicActionResult
    : TOpType extends
          | OpType.ParticipantCreate
          | OpType.AssetTransfer
          | OpType.AssetApprove
          | OpType.AssetRevoke
          | OpType.AssetLockup
          | OpType.AssetRelease
          | OpType.AccountConfigure
    ? NoOperationResult
    : unknown;

export interface IxResult<TOpType extends OpType> {
    type: TOpType;
    status: OperationStatus;
    data: IxOpResult<TOpType>;
}

export type AnyIxOperationResult =
    | IxResult<OpType.AssetCreate>
    | IxResult<OpType.AssetTransfer>
    | IxResult<OpType.AssetApprove>
    | IxResult<OpType.AssetRevoke>
    | IxResult<OpType.AssetLockup>
    | IxResult<OpType.AssetRelease>
    | IxResult<OpType.LogicDeploy>
    | IxResult<OpType.LogicEnlist>
    | IxResult<OpType.LogicInvoke>
    | IxResult<OpType.AccountConfigure>
    | IxResult<OpType.ParticipantCreate>;
