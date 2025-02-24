import type { EventEmitter } from "events";
import type { Identifier } from "js-moi-identifiers";
import type {
    Account,
    AccountAsset,
    AccountKey,
    Asset,
    ExtractModifier,
    Hex,
    IncludeModifier,
    Interaction,
    InteractionRequest,
    Logic,
    LogicMessage,
    NetworkInfo,
    ResponseModifierParam,
    Simulate,
    StorageKey,
    Tesseract,
    TesseractReference,
    TesseractReferenceParam,
} from "js-moi-utils";
import type { InteractionResponse } from "../utils/interaction-response";
import type { MethodParams, NestedArray } from "./moi-execution-api";

type NonOptionalKeys<T extends Record<string, any>> = {
    [K in keyof T]-?: T extends { [K1 in K]: any } ? K : never;
}[keyof T];

type NonUndefined<T> = T extends undefined ? never : T;

export type SelectFromResponseModifier<TObject extends Record<string, any>, TModifier extends ResponseModifierParam> =
    TModifier extends Required<ResponseModifierParam<infer K>> ?
        K extends keyof TObject ?
            TModifier extends { modifier: ExtractModifier<infer E> } ? NonUndefined<TObject[E]>
            : TModifier extends { modifier: IncludeModifier<infer E> } ? Required<Pick<TObject, E>> & Pick<TObject, NonOptionalKeys<TObject>>
            : Pick<TObject, NonOptionalKeys<TObject>>
        :   Pick<TObject, NonOptionalKeys<TObject>>
    :   Pick<TObject, NonOptionalKeys<TObject>>;

export type GetNetworkInfoOption = ResponseModifierParam<keyof NetworkInfo>;

/**
 * Structure for `moi.Protocol` to get network information.
 */
interface ProtocolRequest {
    /**
     * Get the version and chain ID of the network.
     *
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the network information.
     */
    getNetworkInfo<TOption extends GetNetworkInfoOption>(option?: TOption): Promise<SelectFromResponseModifier<NetworkInfo, TOption>>;
}

export type SimulateOption = Pick<MethodParams<"moi.Simulate">[0], "references">;

export type SimulateInteractionRequest = Omit<InteractionRequest, "fuel_limit">;

interface SimulateRequest {
    /**
     * Simulate an interaction.
     *
     * @param ix - Interaction to simulate.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the simulation result.
     */
    simulate(ix: SimulateInteractionRequest, option?: SimulateOption): Promise<Simulate>;
    /**
     * Simulate an interaction.
     *
     * @param interaction - Interaction to simulate.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the simulation result.
     */
    simulate(interaction: Uint8Array | Hex, option?: SimulateOption): Promise<Simulate>;
}

export type AccountRequestOption = ResponseModifierParam<Exclude<keyof Account, "metadata">> & TesseractReferenceParam;

interface AccountRequest {
    /**
     * Get an account.
     *
     * @param participant - Identifier of the account.
     * @param option - Optional parameters for the request.
     * @returns a promise that resolves to the account.
     */
    getAccount<TOption extends AccountRequestOption>(participant: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Account, TOption>>;
}

export type TesseractRequestOption = ResponseModifierParam<Exclude<keyof Tesseract, "hash" | "tesseract">>;

interface TesseractRequest {
    /**
     * Get a tesseract using participant and height.
     *
     * @param participant - Identifier of the participant.
     * @param height - Height of the tesseract.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the tesseract.
     */
    getTesseract<TOption extends TesseractRequestOption>(participant: Identifier | Hex, height: number, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    /**
     * Get a tesseract using a tesseract hash.
     *
     * @param tesseract - hash of the tesseract.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the tesseract.
     */
    getTesseract<TOption extends TesseractRequestOption>(tesseract: Hex, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
    /**
     * Get a tesseract using a tesseract reference.
     *
     * @param reference - reference of the tesseract.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the tesseract.
     */
    getTesseract<TOption extends TesseractRequestOption>(reference: TesseractReference, option?: TOption): Promise<SelectFromResponseModifier<Tesseract, TOption>>;
}

export type LogicRequestOption = TesseractReferenceParam & ResponseModifierParam<Exclude<keyof Logic, "metadata">>;

interface LogicRequest {
    /**
     * Get the logic information.
     *
     * @param logicId - Identifier of the logic.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the logic.
     */
    getLogic<TOption extends LogicRequestOption>(logicId: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Logic, TOption>>;
}

export type LogicStorageRequestOption = TesseractReferenceParam;

interface LogicStorageRequest {
    /**
     * Get the logic storage using a logic identifier and storage identifier.
     *
     * @param logicId - Identifier of the logic.
     * @param storageId - storage key from which to access the storage.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the storage value.
     */
    getLogicStorage(logicId: Identifier | Hex, storageId: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
    /**
     * Get the logic storage using a logic identifier, participant identifier, and storage identifier.
     *
     * @param logicId - Identifier of the logic.
     * @param participant - Identifier of the participant.
     * @param storageKey - storage key from which to access the storage.
     *
     * @returns a promise that resolves to the storage value.
     */
    getLogicStorage(logicId: Identifier | Hex, participant: Identifier, storageKey: Hex | StorageKey, option?: LogicStorageRequestOption): Promise<Hex>;
}

export type AssetRequestOption = TesseractReferenceParam & ResponseModifierParam<Exclude<keyof Asset, "metadata">>;

interface AssetRequest {
    /**
     * Get an asset using an asset identifier.
     *
     * @param asset - Identifier of the asset.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the asset.
     */
    getAsset<TOption extends AssetRequestOption>(asset: Identifier | Hex, option?: TOption): Promise<SelectFromResponseModifier<Asset, TOption>>;
}

export type LogicMessageRequestOption = Omit<MethodParams<"moi.LogicMessage">[0], "logic_id" | "topics"> & {
    topics?: NestedArray<string>;
};

interface LogicMessageRequest {
    /**
     * Get the logic messages using a logic identifier.
     *
     * @param logic - Identifier of the logic.
     * @param options - Optional parameters for the request.
     *
     * @returns a promise that resolves to the logic messages.
     */
    getLogicMessage(logic: Identifier | Hex, options?: LogicMessageRequestOption): Promise<LogicMessage[]>;
}

export type AccountAssetRequestOption = ResponseModifierParam<Exclude<keyof AccountAsset, "balance">> & TesseractReferenceParam;

interface AccountAssetRequest {
    /**
     * Get an account asset using a participant identifier and asset identifier.
     *
     * @param participant - Identifier of the participant.
     * @param asset - Identifier of the asset.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the account asset.
     */
    getAccountAsset<TOption extends AccountAssetRequestOption>(
        participant: Identifier | Hex,
        asset: Identifier | Hex,
        option?: TOption
    ): Promise<SelectFromResponseModifier<AccountAsset, TOption>>;
}

export type AccountKeyRequestOption = Omit<MethodParams<"moi.AccountKey">[0], "id" | "key_id">;

interface AccountKeyRequest {
    /**
     * Get an account key info using a participant identifier and key index.
     *
     * @param participant - Identifier of the participant.
     * @param index - Index of the key.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the account key.
     */
    getAccountKey(participant: Identifier | Hex, index: number, option?: AccountKeyRequestOption): Promise<AccountKey>;
}

export type ExecuteIx = MethodParams<"moi.Execute">[0];
export type Signature = ExecuteIx["signatures"][number];

interface ExecuteRequest {
    /**
     * Send as interaction request to a network.
     *
     * @param ix - POLO encoded interaction to execute.
     * @param signatures - Signatures for the interaction.
     *
     * @returns a promise that resolves to the interaction response.
     */
    execute(ix: Uint8Array | Hex, signatures: Signature[]): Promise<InteractionResponse>;
    /**
     * Send as interaction request to a network.
     *
     * @param ix - Interaction to execute.
     *
     * @returns a promise that resolves to the interaction response.
     */
    execute(ix: ExecuteIx): Promise<InteractionResponse>;
}

export type InteractionRequestOption = ResponseModifierParam<"confirmation">;

// Type name colliding with the one from `js-moi-utils`
interface InteractionRequestMethod {
    /**
     * Get an interaction using a hash.
     *
     * @param hash - hash of the interaction.
     * @param option - Optional parameters for the request.
     *
     * @returns a promise that resolves to the interaction.
     */
    getInteraction<TOption extends InteractionRequestOption>(hash: Hex, option?: TOption): Promise<SelectFromResponseModifier<Interaction, TOption>>;
}

interface SubscribeRequest {
    /**
     * Subscribe to an event.
     *
     * @param event - event to subscribe to.
     * @param params - parameters for the subscription.
     *
     * @returns a promise that resolves to the subscription ID.
     */
    subscribe(event: string, params?: unknown): Promise<string>;
}

interface UnsubscribeRequest {
    /**
     * Unsubscribe from an event.
     *
     * @param subscription - subscription ID.
     *
     * @returns a promise that resolves to a boolean indicating if the unsubscription was successful.
     */
    unsubscribe(subscription: string): Promise<boolean>;
}

export interface Provider
    extends EventEmitter,
        AccountAssetRequest,
        AccountKeyRequest,
        AccountRequest,
        AssetRequest,
        ExecuteRequest,
        InteractionRequestMethod,
        LogicMessageRequest,
        LogicRequest,
        LogicStorageRequest,
        ProtocolRequest,
        SimulateRequest,
        SubscribeRequest,
        TesseractRequest,
        UnsubscribeRequest {}
