import type { AccountType, AssetStandard, InteractionStatus, LockType, OpType, ReceiptStatus } from "../../enums";
import type { Address, Hex, Quantity } from "../../hex";
import type { IxParticipant, Sender } from "../interaction";
import type { LogicActionPayload, LogicDeployPayload, LogicPayload } from "../ix-operation";
import type { AnyIxOperationResult } from "./ix-result";

export interface NetworkInfo {
    /**
     * The chain ID of the network.
     */
    chain_id: number;
    /**
     * The version of the network.
     */
    version: string;
}

export interface SimulationEffects {
    events: unknown[];
    BalanceChanges: unknown;
}

export interface Simulate {
    hash: Hex;
    status: ReceiptStatus;
    results: AnyIxOperationResult[];
    effort: number;
    effects: SimulationEffects[] | null;
}

export interface AccountMetaData {
    type: AccountType;
    address: Hex;
    height: number;
    tesseract: Hex;
}

export interface AccountState {
    guardians: Hex;
    controls: Hex;
    assets: Hex;
    logics: Hex;
    storage: Hex;
}

export interface AccountKey {
    key_id: number;
    weight: number;
    revoked: boolean;
    public_key: Hex;
    sequence: number;
    algorithm: number;
}

export interface AccountBalance {
    asset_id: Hex;
    amount: Quantity;
}

export interface AccountMandate {
    asset_id: Hex;
    spender: Address;
    amount: Quantity;
}

export interface AccountLockup {
    asset_id: Hex;
    locker: Address;
    amount: Quantity;
}

export type KramaID = string;

export interface Guardians {
    behavior: KramaID[];
    stochastic: KramaID[];
}

export interface Controls {}

export interface Enlisted {}

export interface Account {
    metadata: AccountMetaData;
    state?: AccountState;
    keys?: AccountKey[];
    balances?: AccountBalance[];
    mandates?: AccountMandate[];
    lockups?: AccountLockup[];
    guardians?: Guardians;
    enlisted?: Enlisted;
}

export interface FuelInfo {
    limit: number;
    bonus: number;
    spent: number;
}

export interface TesseractData {
    seal: Hex;
    epoch: Quantity;
    time: number;
    fuel: FuelInfo;
    interactions: Hex;
    confirmations: Hex;
    accounts: Hex;
}

export interface Stochastic {
    size: number;
    nodes: KramaID[];
}

export interface ICS {
    seed: Hex;
    proof: Hex;
    cluster_id: string;
    stochastic: Stochastic;
}

export interface PreviousICS {
    address: Address;
    commit_hash: Hex;
    evidence_hash: Hex;
}

export interface Commits {
    qc_type: string;
    signer_indices: string[];
    signature: Hex;
    previous_ics: PreviousICS[];
}

export interface ConsensusInfo {
    ics: ICS;
    operator: KramaID;
    proposer: KramaID;
    propose_view: number;
    commit_view: number;
    commits: Commits;
}

export interface IxAccount {
    identifier: Address;
    lock_type: LockType;
    notary: Address;
}

export interface Consensus {
    mtq: number;
    nodes: KramaID[] | null;
}

export interface Preference {
    compute: Hex;
    consensus: Consensus;
}

export interface ParticipantCreateOperation {
    address: Address;
    amount: Quantity;
}

export interface AssetCreateOperation {
    symbol: string;
    supply: Quantity;
    dimension: number;
    standard: AssetStandard;
    is_logical: boolean;
    is_stateful: boolean;
    logic?: LogicPayload;
}

export interface AssetActionOperation {
    benefactor: Address;
    beneficiary: Address;
    asset_id: Hex;
    amount: Quantity;
    timestamp: Hex;
}

export interface AssetSupplyOperation {
    asset_id: Hex;
    amount: Quantity;
}

export type OperationPayload<T extends OpType> =
    T extends OpType.ParticipantCreate ? ParticipantCreateOperation
    : T extends OpType.AssetCreate ? AssetCreateOperation
    : T extends OpType.AssetTransfer | OpType.AssetApprove | OpType.AssetRevoke | OpType.AssetLockup | OpType.AssetRelease ? AssetActionOperation
    : T extends OpType.LogicDeploy ? LogicDeployPayload
    : T extends OpType.LogicEnlist | OpType.LogicInvoke ? LogicActionPayload
    : never;

export interface Operation<T extends OpType> {
    type: T;
    payload: OperationPayload<T>;
}

export type OperationItem =
    | Operation<OpType.AssetCreate>
    | Operation<OpType.AssetTransfer>
    | Operation<OpType.AssetApprove>
    | Operation<OpType.AssetRevoke>
    | Operation<OpType.AssetLockup>
    | Operation<OpType.AssetRelease>
    | Operation<OpType.LogicDeploy>
    | Operation<OpType.LogicEnlist>
    | Operation<OpType.LogicInvoke>;

export interface InteractionInfo {
    sender: Sender;
    sponsor: Sender;
    fuel_price: number;
    fuel_limit: number;
    fuel_bonus: number;
    operations: OperationItem[];
    accounts: IxParticipant[];
    metadata: Hex;
    preference: Preference;
    perception: Hex;
}

export interface TesseractInfo {
    hash: Hex;
    ix_index: number;
}

export interface InteractionConfirmation {
    status: ReceiptStatus;
    tesseract: TesseractInfo;
    operations: AnyIxOperationResult[];
    fuel_spent: number;
}

export interface Interaction {
    hash: Hex;
    status: InteractionStatus;
    interaction: InteractionInfo;
    confirmation?: InteractionConfirmation;
}

export interface Tesseract {
    hash: Hex;
    tesseract: TesseractData;
    consensus?: ConsensusInfo;
    interactions?: Interaction[];
    confirmations?: InteractionConfirmation[];
}

export interface LogicMetadata {
    logic_id: Hex;
    runtime: number;
    persistent: boolean;
    ephemeral: boolean;
}

export interface LogicController {}

export interface Logic {
    metadata: LogicMetadata;
    manifest?: Hex;
    controller?: LogicController;
    edition?: string[];
}

export interface AssetMetadata {
    latest_id: Hex;
    standard: AssetStandard;
    logical: boolean;
    supply: Quantity;
}

export interface AssetController {}

export interface AssetCreator {
    address: Address;
    balance: Quantity;
}

export interface Asset {
    metadata: AssetMetadata;
    controller?: AssetController;
    creator?: AssetCreator;
    editions?: Hex[];
}

export interface LogicEvent {
    logic_id: Hex;
    address: Address;
    topics: Hex[];
    data: Hex;
}

export interface LogicSource {
    interaction: Hex;
    tesseract: Hex;
}

export interface LogicMessage {
    event: LogicEvent;
    source: LogicSource;
}

export interface Mandate {
    spender: Address;
    amount: Quantity;
}

export interface Lockup {
    locker: Address;
    amount: Quantity;
}

export interface AccountAsset {
    balance: Quantity;
    mandate?: Mandate[];
    lockup?: Lockup[];
}
