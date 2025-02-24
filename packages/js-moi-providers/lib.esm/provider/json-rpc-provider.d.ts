import { EventEmitter } from "events";
import { Identifier } from "js-moi-identifiers";
import { StorageKey, type Account, type AccountAsset, type AccountKey, type Asset, type Hex, type Interaction, type JsonRpcResponse, type Logic, type LogicMessage, type NetworkInfo, type Simulate, type Tesseract, type TesseractReference, type Transport } from "js-moi-utils";
import type { MethodParams, MethodResponse, NetworkMethod } from "../types/moi-execution-api";
import type { AccountAssetRequestOption, AccountKeyRequestOption, AccountRequestOption, AssetRequestOption, ExecuteIx, GetNetworkInfoOption, InteractionRequestOption, LogicMessageRequestOption, LogicRequestOption, LogicStorageRequestOption, Provider, SelectFromResponseModifier, Signature, SimulateInteractionRequest, SimulateOption, TesseractRequestOption } from "../types/provider";
import { InteractionResponse } from "../utils/interaction-response";
/**
 * A provider that communicates with the MOI protocol network using JSON-RPC.
 *
 * @extends EventEmitter
 * @implements Provider
 *
 * @param {Transport} transport - The transport to use for communication with the network.
 */
export declare class JsonRpcProvider extends EventEmitter implements Provider {
    private readonly _transport;
    /**
     * Creates a new instance of the provider.
     *
     * @param transport - The transport to use for communication with the network.
     */
    constructor(transport: Transport);
    /**
     * The transport used to communicate with the network.
     */
    get transport(): Transport;
    protected call<TMethod extends NetworkMethod, TResponse extends any = MethodResponse<TMethod>>(method: TMethod, ...params: MethodParams<TMethod>): Promise<TResponse>;
    /**
     * Sends a JSON-RPC request to the network. This method is used internally
     * to send requests to the network.
     *
     * Developers can use this method to send custom requests to the network that
     * are supported by ``Provider``. Please refer to the `MOI protocol documentation <https://docs.moi.technology/docs/build/json-rpc/>`_
     * for a list of supported methods.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const version = await provider.request("moi.Protocol", {
     *      modifier: { extract: "version" }
     * });
     *
     * console.log(response);
     *
     * >>> { jsonrpc: "2.0", id: "2fb48ce4-3d38-45e4-87a5-0aa9d3d70299", result: "0.12.0" }
     */
    request<T>(method: string, params?: unknown[]): Promise<JsonRpcResponse<T>>;
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const version = await provider.getNetworkInfo({
     *    modifier: { extract: "version" },
     * });
     *
     * console.log(version);
     *
     * >>> "0.12.0"
     */
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
    /**
     * Simulates an interaction on the MOI protocol network.
     *
     * @param ix - The interaction to simulate.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the result of the simulation.
     */
    simulate(ix: SimulateInteractionRequest, option?: SimulateOption): Promise<Simulate>;
    /**
     * Simulates an interaction on the MOI protocol network.
     *
     * @param ix - POLO encoded interaction to simulate.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the result of the simulation.
     */
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    /**
     * Retrieves an account from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const account = await provider.getAccount("0x..123");
     *
     * console.log(account);
     */
    getAccount<TOption extends AccountRequestOption>(participant: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
    private getTesseractByReference;
    /**
     * Retrieves a tesseract from the MOI network.
     *
     * @param identifier - The identifier of the tesseract to retrieve.
     * @param height - The height of the tesseract to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the tesseract information.
     */
    getTesseract<TOption extends TesseractRequestOption>(participant: Identifier | Hex, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    /**
     * Retrieves a tesseract from the MOI network.
     *
     * @param tesseract - The hash of the tesseract to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the tesseract information.
     */
    getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    /**
     * Retrieves a tesseract from the MOI network.
     *
     * @param reference - The reference of the tesseract to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the tesseract information.
     */
    getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    /**
     * Retrieves a logic from the MOI network.
     *
     * @param identifier - The identifier of the logic to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the logic information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const manifest = await provider.getLogic("0x..123", {
     *     modifier: { extract: "manifest" },
     * });
     *
     * console.log(manifest);

     */
    getLogic<TOption extends LogicRequestOption>(identifier: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    /**
     * Retrieves the storage value of a logic from the MOI network.
     *
     * @param logic - The identifier of the logic to retrieve.
     * @param storage - The identifier of the storage to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the storage value.
     */
    getLogicStorage(logic: Identifier | Hex, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    /**
     * Retrieves the storage value of a logic from the MOI network.
     *
     * @param logic - The identifier of the logic to retrieve.
     * @param participant - The identifier of the participant to retrieve.
     * @param storageKey - The key of the storage to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the storage value.
     */
    getLogicStorage(logic: Identifier | Hex, participant: Identifier, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    /**
     * Retrieves an asset from the MOI network.
     *
     * @param asset - The identifier of the asset to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the asset information.
     */
    getAsset<TOption extends AssetRequestOption>(asset: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
    private encodeTopics;
    /**
     * Retrieves logic messages from the MOI network.
     *
     * @param logic - The identifier of the logic to retrieve messages for.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the logic messages.
     */
    getLogicMessage(logic: Identifier | Hex, options?: LogicMessageRequestOption): Promise<LogicMessage[]>;
    /**
     * Retrieves an account asset from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve the asset for.
     * @param asset - The identifier of the asset to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account asset information.
     */
    getAccountAsset<TOption extends AccountAssetRequestOption>(participant: Identifier | Hex, asset: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<AccountAsset, TOption>>;
    /**
     * Retrieves an account key information from the MOI network.
     *
     * @param participant - The identifier of the account to retrieve the key for.
     * @param index - The index of the key to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the account key information.
     */
    getAccountKey(participant: Identifier | Hex, index: number, option?: AccountKeyRequestOption): Promise<AccountKey>;
    /**
     * Executes an interaction on the MOI network.
     *
     * @param ix - The interaction to execute.
     * @param signatures - The signatures to include in the request.
     *
     * @returns A promise that resolves to the result of the InteractionResponse.
     */
    execute(ix: Uint8Array | Hex, signatures: Signature[]): Promise<InteractionResponse>;
    /**
     * Executes an interaction on the MOI network.
     *
     * @param ix - The execution request object.
     *
     * @returns A promise that resolves to the InteractionResponse.
     */
    execute(ix: ExecuteIx): Promise<InteractionResponse>;
    /**
     * Retrieves an interaction from the MOI network.
     *
     * @param hash - The hash of the interaction to retrieve.
     * @param option - Additional options to include in the request.
     *
     * @returns A promise that resolves to the interaction information.
     *
     * @example
     * import { HttpProvider } from "js-moi-sdk";
     *
     * const provider = new HttpProvider("...");
     * const interaction = await provider.getInteraction("0x..123", {
     *     modifier: { include: ["confirmation"] },
     * });
     *
     * console.log(interaction.confirmation);
     */
    getInteraction<TOption extends InteractionRequestOption>(hash: Hex, option?: TOption): Promise<SelectFromResponseModifier<Interaction, TOption>>;
    /**
     * Subscribes to an event on the MOI network.
     *
     * @param event - The event to subscribe to.
     * @param params - Additional parameters to include in the request.
     *
     * @returns A promise that resolves when the subscription is complete.
     */
    subscribe(event: string, params?: unknown[]): Promise<string>;
    /**
     * Unsubscribes from a subscription.
     * @param subscription id of the subscription to unsubscribe from.
     * @returns a promise that resolves when the un-subscription is successful.
     */
    unsubscribe(subscription: string): Promise<boolean>;
    /**
     * Processes a JSON-RPC response and returns the result.
     * If the response contains an error, it throws an error with the provided message, code, and data.
     *
     * @template T - The type of the result expected from the JSON-RPC response.
     * @param {JsonRpcResponse<T>} response - The JSON-RPC response to process.
     * @returns {T} - The result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    processJsonRpcResponse<T>(response: JsonRpcResponse<T>): T;
}
//# sourceMappingURL=json-rpc-provider.d.ts.map