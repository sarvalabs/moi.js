import { LogicManifest } from "js-moi-manifest";
import { Interaction, Tesseract } from "js-moi-utils";
import type { AccountMetaInfo, AccountState, AssetInfo, CallorEstimateIxObject, CallorEstimateOptions, Content, ContentFrom, ContextInfo, Encoding, Filter, FilterDeletionResult, Inspect, InteractionCallResponse, InteractionReceipt, InteractionRequest, InteractionResponse, Log, LogFilter, NodeInfo, Options, Registry, RpcResponse, Status, SyncStatus, TDU, ExecutionResult } from "../types/jsonrpc";
import type { ProviderEvents } from "../types/websocket";
import { AbstractProvider } from "./abstract-provider";
export interface EventTag {
    event: string;
    params?: unknown;
}
/**
 * Class representing a base provider for interacting with the MOI protocol.
 * Extends the AbstractProvider class and provides implementations for
 * account operations, execution, and querying RPC methods.
 */
export declare class BaseProvider extends AbstractProvider {
    constructor();
    /**
     * Helper function to process the RPC response and extract the relevant data.
     * If the response has a result, it checks if the result has data and returns it.
     * Otherwise, it throws an error with the corresponding error message.
     *
     * @param {RpcResponse} response - The RPC response to be processed.
     * @returns {any} The extracted data from the response.
     * @throws {Error} if the response does not have a result or if the result
     * does not have data.
     */
    protected processResponse<T>(response: RpcResponse<T>): T;
    /**
     * Retrieves the balance of the specified address for the given asset id.
     *
     * @param {string} address - The address for which to retrieve the balance.
     * @param {string} assetId - The asset id for which to retrieve the balance.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the balance
     * as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getBalance(address: string, assetId: string, options?: Options): Promise<number | bigint>;
    /**
     * Retrieves the context information for the specified address.
     *
     * @param {string} address - The address for which to retrieve the context
     * information.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<ContextInfo>} A Promise that resolves to the context
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getContextInfo(address: string, options?: Options): Promise<ContextInfo>;
    /**
     * Retrieves the TDU (Total Digital Utility) for the specified address.
     *
     * @param {string} address - The address for which to retrieve the TDU.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<TDU[]>} A Promise that resolves to the TDU object.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getTDU(address: string, options?: Options): Promise<TDU[]>;
    /**
     * Retrieves the interaction information for the specified interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction to retrieve.
     * @returns {Promise<Interaction>} A Promise that resolves to the interaction information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionByHash(ixHash: string): Promise<Interaction>;
    /**
     * Retrieves the interaction information for the specified address and tesseract options.
     *
     * @param address - The address for which to retrieve the interaction.
     * @param options - The tesseract options. (optional)
     * @param ix_index - The index of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    getInteractionByTesseract(address: string, options?: Options, ix_index?: number): Promise<Interaction>;
    /**
     * Retrieves the interaction information for the specified tesseract options.
     *
     * @param options - The tesseract options. (optional)
     * @param ix_index - The index of the interaction to retrieve.
     * @returns A Promise that resolves to the interaction information.
     * @throws Error if there is an error executing the RPC call.
     */
    getInteractionByTesseract(options: Options, ix_index?: number): Promise<Interaction>;
    /**
     * Retrieves the total number of interactions for the specified address.
     *
     * @param {string} address - The address for which to retrieve the interaction count.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<number | bigint>} A Promise that resolves to the number
     * of interactions as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionCount(address: string, options?: Options): Promise<number | bigint>;
    /**
     * Retrieves the total number of interactions for the specified address,
     * including the pending interactions in IxPool.
     *
     * @param {string} address - The address for which to retrieve the pending
     * interaction count.
     * @returns {Promise<number | bigint>} A Promise that resolves to the number
     * of pending interactions
     * as a number or bigint.
     * @throws Error if there is an error executing the RPC call.
     */
    getPendingInteractionCount(address: string): Promise<number | bigint>;
    /**
     * Retrieves the account state for the specified address.
     *
     * @param {string} address - The address for which to retrieve the account
     * state.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<AccountState>} A Promise that resolves to the account
     * state.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getAccountState(address: string, options?: Options): Promise<AccountState>;
    /**
     * Retrieves the account meta information for the specified address.
     *
     * @param {string} address - The address for which to retrieve the account
     * meta information.
     * @returns {Promise<AccountMetaInfo>} A Promise that resolves to the
     * account meta information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getAccountMetaInfo(address: string): Promise<AccountMetaInfo>;
    /**
     * Retrieves the content from a specific address.
     *
     * @param {string} address - The address for which to retrieve the content.
     * @returns {Promise<ContentFrom>} A Promise that resolves to the content
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getContentFrom(address: string): Promise<ContentFrom>;
    /**
     * Retrieves the wait time for a specific account in ixpool.
     *
     * @param {string} address - The address for which to retrieve the wait time.
     * @returns {Promise<number | bigint>} A promise that resolves to the wait
     * time (in seconds) as a number or bigint.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getWaitTime(address: string): Promise<number | bigint>;
    /**
     * Initializes a filter for retrieving newly detected terreracts.
     * The filter setup triggers a 1-minute timeout period, and with each subsequent query,
     * the timeout is reset to 1 minute.
     *
     * @returns {Promise<Filter>} An object containing the filter id for the NewTesseractFilter.
     * @throws {Error} Throws an error if there is an issue executing the RPC call.
     */
    getNewTesseractFilter(): Promise<Filter>;
    /**
     * Initiates a filtering mechanism to fetch recently identified tesseracts
     * associated with a specific account. The filter setup triggers a 1-minute
     * timeout period, and with each subsequent request, the timeout is reset to 1 minute.
     *
     * @param {string} address - The address of the target account for which new tesseracts are filtered.
     * @returns {Promise<Filter>} An object containing the filter id for the NewTesseractFilter.
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    getNewTesseractsByAccountFilter(address: string): Promise<Filter>;
    /**
     * Initiates a filtering mechanism to fetch recently identified pending interaction.
     * The filter setup triggers a 1-minute timeout period, and with each subsequent request,
     * the timeout is reset to 1 minute.
     *
     * @returns {Promise<Filter>} A object containing the Filter ID for PendingIxnsFilter
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    getPendingInteractionFilter(): Promise<Filter>;
    /**
     * Create a filter object for the logs.
     *
     * @param {LogFilter} filter - The log filter object.
     * @returns {Promise<Filter>} A promise that resolves to a Filter object.
     */
    getLogsFilter(filter: LogFilter): Promise<Filter>;
    /**
     * Asynchronously removes the filter and returns a Promise that resolves to a
     * object.
     * The object has a `status` property, which is true if the filter is successfully removed, otherwise false.
     *
     * @returns {Promise<FilterDeletionResult>} A Promise that resolves to an object with a `status` property indicating the success of the filter removal.
     * @throws {Error} Throws an error if there is an error executing the RPC call.
     */
    removeFilter(filter: Filter): Promise<FilterDeletionResult>;
    /**
     * Retrieves all filter changes since the last poll.
     *
     * The specific result varies depending on the type of filter used.
     *
     * @param {Filter} filter - The filter object for which changes are to be retrieved.
     *
     * @returns {Promise<T>} A promise that resolves to an object containing information about the changes made to the specified filter since the last poll. The structure of the object is determined by the type of filter provided.
     * @throws {Error} Throws an error if there is an issue executing the RPC call.
     *
     * @template T - The type of the object returned, dependent on the provided filter.
     */
    getFilterChanges<T extends any>(filter: Filter): Promise<T>;
    /**
     * Retrieves a Tesseract for a specific address.
     *
     * @param {string} address - The address for which to retrieve the Tesseract.
     * @param {boolean} with_interactions - A boolean value indicating whether to include
     * interactions in the Tesseract.
     * @param {Options | undefined} options - The tesseract options. (optional)
     * @returns {Promise<Tesseract>} A promise that resolves to the Tesseract.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getTesseract(address: string, with_interactions: boolean, with_commit_info: boolean, options?: Options): Promise<Tesseract>;
    /**
      * Retrieves a Tesseract for a specified tesseract hash.
      *
      * @param {boolean} with_interactions - A boolean value indicating whether to include
      * interactions in the Tesseract.
      * @param {Options} options - The tesseract options. (optional)
      * @returns {Promise<Tesseract>} A promise that resolves to the Tesseract.
      * @throws {Error} if there is an error executing the RPC call.
      */
    getTesseract(with_interactions: boolean, with_commit_info: boolean, options: Options): Promise<Tesseract>;
    /**
     * Retrieves the logic id's associated with a specific address.
     *
     * @param {string} address - The address for which to retrieve the logic id's.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string[]>} A Promise that resolves to an array of logic id's.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getLogicIds(address: string, options?: Options): Promise<string[]>;
    /**
     * Retrieves the registry for a specific address.
     *
     * @param {string} address - The address for which to retrieve the registry.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<Registry>} A Promise that resolves to the registry.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getRegistry(address: string, options?: Options): Promise<Registry>;
    /**
     * Retrieves the synchronization status for a specific account.
     *
     * @param {string | undefined} address - The address for which to retrieve the synchronization status.
     * @returns {Promise<SyncStatus>} A Promise that resolves to the synchronization status.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getSyncStatus(address?: string): Promise<SyncStatus>;
    /**
     * Handles the interaction without modifying the account's current state.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<InteractionCallResponse>} A Promise resolving to the
     * interaction call response.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    call(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<InteractionCallResponse>;
    /**
     * Estimates the amount of fuel required for processing the interaction.
     *
     * @param {CallorEstimateIxObject} ixObject - The interaction object.
     * @param {CallorEstimateOptions} options - The interaction options. (optional)
     * @returns {Promise<number | bigint>} A Promise resolving to the estimated
     * fuel amount.
     * @throws {Error} if there's an issue executing the RPC call or
     * processing the response.
     */
    estimateFuel(ixObject: CallorEstimateIxObject, options?: CallorEstimateOptions): Promise<number | bigint>;
    /**
     * Sends an interaction request.
     *
     * @param {InteractionRequest} ixObject - The interaction request object.
     * @returns {Promise<InteractionResponse>} A Promise that resolves to the
     * interaction response.
     * @throws {Error} if there is an error executing the RPC call or
     * processing the response.
     */
    sendInteraction(ixObject: InteractionRequest): Promise<InteractionResponse>;
    /**
     * Retrieves the asset information for a specific asset id.
     *
     * @param {string} assetId - The asset id for which to retrieve the
     * asset information.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<AssetInfo>} A Promise that resolves to the asset
     * information.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getAssetInfoByAssetID(assetId: string, options?: Options): Promise<AssetInfo>;
    /**
     * Retrieves the interaction receipt for a specific interaction hash.
     *
     * @param {string} ixHash - The hash of the interaction for which to
     * retrieve the receipt.
     * @returns {Promise<InteractionReceipt>} A Promise that resolves to the
     * interaction receipt.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getInteractionReceipt(ixHash: string): Promise<InteractionReceipt>;
    /**
     * Retrieves the storage entry corresponding to a specific storage key and logic id.
     *
     * @param {string} logicId - The logic id for which to retrieve the storage value.
     * @param {string} storageKey - The storage key for which to retrieve the value.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string>} A Promise that resolves to the storage value.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getStorageAt(logicId: string, storageKey: string, options?: Options): Promise<string>;
    /**
     * Retrieves the storage entry corresponding to a specific storage key, address and logic id.
     *
     * @param {string} logicId - The logic id for which to retrieve the storage value.
     * @param {string} storageKey - The storage key for which to retrieve the value.
     * @param {string} address - The address related to the storage key (optional).
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string>} A Promise that resolves to the storage value.
     * @throws {Error} if there is an error executing the RPC call.
     */
    getStorageAt(logicId: string, storageKey: string, address: string, options?: Options): Promise<string>;
    /**
     * Retrieves the logic manifest for a specific logic id.
     *
     * @param {string} logicId - The logic id for which to retrieve the logic manifest.
     * @param {Encoding} encoding - The encoding format of the manifest.
     * @param {Options} options - The tesseract options. (optional)
     * @returns {Promise<string | LogicManifest.Manifest>} A Promise that
     * resolves to the logic manifest as a POLO encode string or a parsed JSON object.
     * @throws {Error} if there is an error executing the RPC call or processing the response.
     */
    getLogicManifest(logicId: string, encoding: Encoding, options?: Options): Promise<string | LogicManifest.Manifest>;
    private hashTopics;
    /**
     * Retrieves all tesseract logs associated with a specified account within the provided tesseract range.
     * If the topics are not provided, all logs are returned.
     *
     * @param {string} address - The address for which to retrieve the tesseract logs.
     * @param {Tuple<number>} height - The height range for the tesseracts. The start height is inclusive, and the end height is exclusive.
     * @param {NestedArray<string>}topics - The topics to filter the logs. (optional)
     *
     * @returns A Promise that resolves to an array of logs.
     *
     * @throws Error if difference between start height and end height is greater than 10.
     */
    getLogs(logFilter: LogFilter): Promise<Log[]>;
    /**
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution.
     *
     * @returns {Promise<Content>} A Promise that resolves to the content of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getContent(): Promise<Content>;
    /**
     * Retrieves the total number of pending and queued interactions in
     * the interaction pool.
     *
     * @returns {Promise<Status>} A Promise that resolves to the status of the
     * interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getStatus(): Promise<Status>;
    /**
     * Retrieves all the interactions that are pending for inclusion in the next
     * Tesseract(s) or are scheduled for future execution. Additionally, it provides
     * a list of all the accounts in the ixpool with their respective wait times.
     * This method is particularly useful for developers, as it can help them
     * quickly review interactions in the pool and identify any potential issues.
     *
     * @returns {Promise<Inspect>} A Promise that resolves to the inspection
     * data of the interaction pool.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getInspect(): Promise<Inspect>;
    /**
     * Retrieves the list of peers connected to the specific moipod.
     *
     * @returns {Promise<string[]>} A Promise that resolves to the list of peers.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getPeers(): Promise<string[]>;
    /**
     * Retrieves the version of the connected network.
     *
     * @returns {Promise<string>} A Promise that resolves to the network
     * version as a string.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getVersion(): Promise<string>;
    /**
     * Retrieves detailed information about the connected node.
     *
     * @returns {Promise<NodeInfo>} A Promise that resolves to an object
     * containing node information.
     * @throws {Error} if there is an error executing the RPC call or processing
     * the response.
     */
    getNodeInfo(): Promise<NodeInfo>;
    getSubscription(event: ProviderEvents): Promise<string>;
    private validateAndFormatEvent;
    /**
     * Waits for the interaction with the specified hash to be included in a tesseract
     * and returns the interaction receipt.
     *
     * @param {string} interactionHash - The hash of the interaction.
     * @param {number} timeout - The timeout duration in seconds (optional).
     * @returns {Promise<InteractionReceipt>} A Promise that resolves to the
     * interaction receipt.
     * @throws {Error} if there is an error executing the RPC call, processing
     * the response, or the timeout is reached.
     */
    protected waitForInteraction(interactionHash: string, timeout?: number): Promise<InteractionReceipt>;
    /**
     * Process the interaction receipt to determine the appropriate execution result
     * based on the operation type.
     *
     * @param {InteractionReceipt} receipt - The interaction receipt to be processed.
     * @returns {ExecutionResult[]} The processed execution results based on the operation type.
     * @throws {Error} If the operation type is unsupported or the expected response
     * data is missing.
     */
    protected processReceipt(receipt: InteractionReceipt): ExecutionResult[];
    protected processWsResult(event: ProviderEvents, result: unknown): unknown;
    /**
     * Waits for the interaction with the specified hash to be included in a
     * tesseract and returns the result based on the interaction type.
     *
     * @param {string} interactionHash - The hash of the interaction.
     * @param {number} timeout - The timeout duration in seconds (optional).
     * @returns {Promise<any>} A Promise that resolves to the result of the
     * interaction.
     * @throws {Error} if there is an error executing the RPC call, processing the
     * response, or the timeout is reached.
     */
    protected waitForResult(interactionHash: string, timeout?: number): Promise<any>;
    /**
     * Checks if the response object represents a server error.
     *
     * @param {Response} response - The Response object.
     * @returns {boolean} A boolean indicating whether the error is a server error.
     */
    protected isServerError(response: Response): boolean;
    /**
     * Executes an RPC method with the specified parameters.
     *
     * @param {string} method - The RPC method to execute.
     * @param {any} params - The parameters to pass to the RPC method.
     * @returns {Promise<any>} A Promise that resolves to the response of the RPC call.
     * @throws {Error} if the method is not implemented.
     */
    protected execute<T = any>(method: string, params: any): Promise<RpcResponse<T>>;
}
//# sourceMappingURL=base-provider.d.ts.map