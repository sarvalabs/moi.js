import { EventEmitter } from "events";
import { LogicManifest } from "js-moi-manifest";
import { Interaction, Tesseract } from "js-moi-utils";
import {
    AccountMetaInfo,
    AccountState,
    AssetInfo,
    CallorEstimateIxObject,
    CallorEstimateOptions,
    Content,
    ContentFrom,
    ContextInfo,
    Encoding,
    Filter, FilterDeletionResult,
    Inspect,
    InteractionCallResponse,
    InteractionReceipt,
    InteractionRequest, InteractionResponse,
    NodeInfo,
    Options,
    Registry,
    Status,
    SyncStatus,
    TDU,
    type Log,
    type LogFilter
} from "../types/jsonrpc";
import { type ProviderEvents } from "../types/websocket";



/**
 * Abstract class representing a provider for interacting with the MOI protocol.
 * Provides methods for account operations, execution, and querying.
 */
export abstract class AbstractProvider extends EventEmitter {
    // Account Methods
    abstract getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>
    abstract getContextInfo(address: string, options?: Options): Promise<ContextInfo>


    abstract getTesseract(address: string, with_interactions: boolean, with_commit_info: boolean, options?: Options): Promise<Tesseract>
    abstract getTesseract(with_interactions: boolean, with_commit_info: boolean, options?: Options): Promise<Tesseract>

    abstract getTDU(address: string, options?: Options): Promise<TDU[]>
    abstract getInteractionByHash(ixHash: string): Promise<Interaction>
    
    abstract getInteractionByTesseract(address: string, options?: Options, ix_index?: number): Promise<Interaction>
    abstract getInteractionByTesseract(options: Options, ix_index?: number): Promise<Interaction>

    abstract getInteractionCount(address: string, options?: Options): Promise<number | bigint>
    abstract getPendingInteractionCount(address: string): Promise<number | bigint>
    abstract getAccountState(address: string, options?: Options): Promise<AccountState>
    abstract getAccountMetaInfo(address: string, options?: Options): Promise<AccountMetaInfo>
    abstract getLogicIds(address: string, options?: Options): Promise<string[]>
    abstract getRegistry(address: string, options?: Options): Promise<Registry>
    abstract getSyncStatus(address?: string): Promise<SyncStatus>
    abstract getContentFrom(address: string): Promise<ContentFrom>
    abstract getWaitTime(address: string): Promise<number|bigint>

    // Execution Methods
    abstract call(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<InteractionCallResponse>
    abstract estimateFuel(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<number | bigint>
    abstract sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse>

    // Query Methods
    abstract getAssetInfoByAssetID(assetId: string): Promise<AssetInfo>
    abstract getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>
    abstract getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<string>
    abstract getStorageAt(logicId: string, storageKey: string, address: string, options?: Options): Promise<string>
    abstract getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>
    abstract getContent(): Promise<Content>
    abstract getStatus(): Promise<Status>
    abstract getInspect(): Promise<Inspect>
    abstract getPeers(): Promise<string[]>
    abstract getVersion(): Promise<string>
    abstract getNodeInfo(): Promise<NodeInfo>
    abstract getNewTesseractFilter(): Promise<Filter>
    abstract getNewTesseractsByAccountFilter(address: string): Promise<Filter>
    abstract getPendingInteractionFilter(): Promise<Filter>
    abstract getFilterChanges<T extends any>(filter: Filter): Promise<T>
    abstract removeFilter(filter: Filter): Promise<FilterDeletionResult>
    abstract getLogsFilter(filter: LogFilter): Promise<Filter>
    abstract getLogs(filter: LogFilter): Promise<Log[]>;
    abstract getSubscription(event: ProviderEvents) : Promise<string>;
}