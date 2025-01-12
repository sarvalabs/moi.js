import { Hex, OpType, type AccountType, type Address, type IxOperation, type LockType, type NetworkInfo, type OperationStatus, type ReceiptStatus, type ResponseModifierParam } from "js-moi-utils";
import type { AccountParam, AssetParam, IncludesParam, InteractionParam, LogicParam, SignedInteraction, TesseractReferenceParam } from "./shared";
interface Account {
    address: Address;
    sequence_id: number;
    key_id: number;
}
interface ParticipantContextDelta {
    behavior: Hex[];
    stochastic: Hex[];
    replaced: Hex[];
}
interface ParticipantContext {
    latest: Hex;
    previous: Hex;
    delta: ParticipantContextDelta;
}
export interface Participant {
    address: Hex;
    height: number;
    lock_type: LockType;
    notary: boolean;
    transition: Hex;
    state: Hex;
    context: ParticipantContext;
}
export interface InteractionShared {
    sender: Account;
    payer: Address;
    fuel_limit: number;
    fuel_price: number;
    ix_operations: IxOperation[];
}
export interface Fund {
    asset_id: Hex;
    amount: number;
}
interface InteractionPreference {
    compute: Hex;
    consensus: {
        mtq: Hex;
        trust_nodes: Hex[];
    };
}
export interface BaseInteractionRequest extends Omit<InteractionShared, "payer"> {
    payer?: Address;
    funds?: Fund[];
    participants?: Pick<Participant, "address" | "lock_type" | "notary">[];
    preferences?: InteractionPreference;
    perception?: Hex;
}
interface InteractionTesseract {
    hash: Hex;
    index: number;
}
export interface Interaction extends InteractionShared {
    hash: Hex;
    tesseract: InteractionTesseract;
    participants: Participant[];
}
interface Consensus {
    ics: {
        seed: Hex;
        proof: Hex;
        cluster_id: Hex;
        stochastic: {
            size: number;
            nodes: Hex[];
        };
    };
    operator: Hex;
    proposer: Hex;
    propose_view: number;
    commit_view: number;
    commits: {
        qc_type: string;
        signer_indices: string;
        signature: Hex;
        previous: {
            address: Hex;
            commit_hash: Hex;
            evidence_hash: Hex;
        };
    };
}
interface TesseractHeader {
    seal: Hex;
    epoch: number;
    timestamp: number;
    interactions: Hex;
    confirmations: Hex;
    fuel: {
        limit: number;
        used: number;
        tip: number;
    };
    participants: Participant[];
}
export interface OperationPayloadConfirmation {
    type: OpType;
    status: string;
    payload: unknown[];
}
export interface Confirmation {
    hash: Hex;
    status: string;
    sender: Hex;
    fuel_used: number;
    tesseract: InteractionTesseract;
    operations: OperationPayloadConfirmation[];
}
export interface Tesseract {
    hash: Hex;
    header: TesseractHeader;
    consensus?: Consensus;
    interactions: Interaction[];
    confirmations: Confirmation[];
}
export interface AccountKey {
    key_id: number;
    weight: number;
    revoked: boolean;
    public_key: Hex;
    sequence: number;
    algorithm: string;
}
interface Mandate {
    spender: Hex;
    amount: number;
}
interface Deposit {
    locker: Hex;
    amount: number;
}
export interface AccountAsset {
    asset_id: Hex;
    balance: number;
    mandates: Mandate[];
    deposits: Deposit[];
}
export type AccountMetadata = {
    type: AccountType;
    address: Address;
    height: number;
    tesseract: Hex;
};
export interface AccountInfo {
    metadata: AccountMetadata;
}
export interface SimulationResult {
    op_type: OpType;
    op_status: OperationStatus;
    data: unknown;
}
export interface SimulationEffect {
    events: any[];
    balanceChanges: any;
}
export interface SimulateResult {
    hash: Hex;
    status: ReceiptStatus;
    effort: number;
    result: SimulationResult[];
    effects: SimulationEffect[] | null;
}
interface MOIExecutionApi {
    "moi.Protocol": {
        params: [option?: ResponseModifierParam<keyof NetworkInfo>];
        response: any;
    };
    "moi.Confirmation": {
        params: [InteractionParam];
        response: any;
    };
    "moi.Tesseract": {
        params: [Required<TesseractReferenceParam>];
        response: any;
    };
    "moi.Interaction": {
        params: [InteractionParam & ResponseModifierParam];
        response: any;
    };
    "moi.Account": {
        params: [option: AccountParam & TesseractReferenceParam & ResponseModifierParam];
        response: any;
    };
    "moi.AccountKey": {
        params: [AccountParam & {
            key_id: number;
            pending?: boolean;
        }];
        response: any;
    };
    "moi.AccountAsset": {
        params: [AccountParam & AssetParam & TesseractReferenceParam & IncludesParam<"moi.AccountAsset">];
        response: any;
    };
    "moi.Asset": {
        params: [AssetParam & TesseractReferenceParam];
        response: any;
    };
    "moi.Logic": {
        params: [LogicParam & TesseractReferenceParam];
        response: any;
    };
    "moi.LogicStorage": {
        params: [LogicParam & Partial<AccountParam> & TesseractReferenceParam & {
            storage_key: Hex;
        }];
        response: any;
    };
    "moi.LogicEvents": {
        params: [];
        response: any;
    };
    "moi.Submit": {
        params: [ix: SignedInteraction];
        response: any;
    };
    "moi.Simulate": {
        params: [ix: Pick<SignedInteraction, "interaction">];
        response: any;
    };
    "moi.Subscribe": {
        params: unknown[];
        response: string;
    };
    "moi.Subscription": {
        params: [];
        response: unknown;
    };
    "moi.SyncStatus": {
        params: [{
            include_pending_accounts?: boolean;
        }];
        response: unknown;
    };
    "moi.Unsubscribe": {
        params: [];
        response: unknown;
    };
}
export type RpcMethod = keyof MOIExecutionApi;
export type RpcMethodParams<T> = T extends RpcMethod ? MOIExecutionApi[T]["params"] : unknown[];
export type RpcMethodResponse<T> = T extends RpcMethod ? MOIExecutionApi[T]["response"] : unknown;
export {};
//# sourceMappingURL=moi-rpc-method.d.ts.map