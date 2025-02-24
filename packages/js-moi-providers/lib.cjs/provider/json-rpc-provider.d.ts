import { EventEmitter } from "events";
import { Identifier } from "js-moi-identifiers";
import { StorageKey, type Account, type AccountAsset, type AccountKey, type Asset, type Hex, type Interaction, type JsonRpcResponse, type Logic, type LogicMessage, type NetworkInfo, type Simulate, type Tesseract, type TesseractReference, type Transport } from "js-moi-utils";
import type { MethodParams, MethodResponse, NetworkMethod } from "../types/moi-execution-api";
import type { AccountAssetRequestOption, AccountKeyRequestOption, AccountRequestOption, AssetRequestOption, ExecuteIx, GetNetworkInfoOption, InteractionRequestOption, LogicMessageRequestOption, LogicRequestOption, LogicStorageRequestOption, Provider, SelectFromResponseModifier, Signature, SimulateInteractionRequest, SimulateOption, TesseractRequestOption } from "../types/provider";
import { InteractionResponse } from "../utils/interaction-response";
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
    /**
     * Calls a JSON-RPC method on the network using the `request` method and processes the response.
     *
     * @param method - The name of the method to invoke.
     * @param params - The parameters to pass to the method.
     *
     * @returns A promise that resolves processed result from the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    protected call<TMethod extends NetworkMethod, TResponse extends any = MethodResponse<TMethod>>(method: TMethod, ...params: MethodParams<TMethod>): Promise<TResponse>;
    /**
     * Sends a JSON-RPC request to the network.
     *
     * @param method - name of the method to invoke.
     * @param params - parameters to pass to the method.
     *
     * @returns A promise that resolves to the JSON-RPC response.
     *
     * @throws Will throw an error if the response contains an error.
     */
    request<T>(method: string, params?: unknown[]): Promise<JsonRpcResponse<T>>;
    /**
     * Retrieves the version and chain id of the MOI protocol network.
     *
     * @returns A promise that resolves to the Moi client version.
     */
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
    simulate(ix: SimulateInteractionRequest, option?: SimulateOption): Promise<Simulate>;
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
    getAccount<TOption extends AccountRequestOption>(participant: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
    private getTesseractByReference;
    getTesseract<TOption extends TesseractRequestOption>(participant: Identifier | Hex, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    getLogic<TOption extends LogicRequestOption>(identifier: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
    getLogicStorage(logic: Identifier | Hex, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    getLogicStorage(logic: Identifier | Hex, participant: Identifier, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    getAsset<TOption extends AssetRequestOption>(asset: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
    private encodeTopics;
    getLogicMessage(logic: Identifier | Hex, options?: LogicMessageRequestOption): Promise<LogicMessage[]>;
    getAccountAsset<TOption extends AccountAssetRequestOption>(participant: Identifier | Hex, asset: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<AccountAsset, TOption>>;
    getAccountKey(participant: Identifier | Hex, index: number, option?: AccountKeyRequestOption): Promise<AccountKey>;
    execute(ix: Uint8Array | Hex, signatures: Signature[]): Promise<InteractionResponse>;
    execute(ix: ExecuteIx): Promise<InteractionResponse>;
    getInteraction<TOption extends InteractionRequestOption>(hash: Hex, option?: TOption): Promise<SelectFromResponseModifier<Interaction, TOption>>;
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