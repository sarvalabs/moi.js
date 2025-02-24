import type { Identifier, LogicId } from "js-moi-identifiers";
import type { Account, AccountAsset, AccountKey, Asset, Hex, Interaction, Logic, LogicMessage, NetworkInfo, ResponseModifierParam, Simulate, Tesseract, TesseractReference, TesseractReferenceParam } from "js-moi-utils";
export type ApiMethod<TParams extends any[], TResponse = any> = {
    params: TParams;
    response: TResponse;
};
interface IdentifierParam<TValue> {
    id: TValue;
}
interface ProtocolRequestParam extends ResponseModifierParam<keyof NetworkInfo> {
}
interface SimulateRequestParam {
    interaction: Hex;
    references?: {
        id: Identifier;
        reference: TesseractReference;
    };
}
interface AccountRequestParam extends IdentifierParam<Identifier | Hex>, ResponseModifierParam<Exclude<keyof Account, "metadata">>, TesseractReferenceParam {
}
interface TesseractRequestParam extends Required<TesseractReferenceParam>, ResponseModifierParam<Exclude<keyof Tesseract, "hash" | "tesseract">> {
}
interface LogicRequestParam extends IdentifierParam<Identifier | Hex>, ResponseModifierParam<Exclude<keyof Logic, "metadata">> {
}
interface LogicStorageRequestParam extends TesseractReferenceParam {
    logic_id: Hex | LogicId;
    storage_id: Hex;
    id?: Hex | Identifier;
}
interface AssetRequestParam extends IdentifierParam<Identifier | Hex>, ResponseModifierParam<Exclude<keyof Asset, "metadata">>, TesseractReferenceParam {
}
export type NestedArray<T> = T[] | NestedArray<T>[];
interface LogicMessageRequestParam {
    logic_id: Identifier | Hex;
    id?: Hex | Identifier;
    topics?: NestedArray<Hex>;
    range?: {
        start: number;
        stop: number;
    };
}
interface AccountAssetRequestParam extends IdentifierParam<Identifier | Hex>, ResponseModifierParam<Exclude<keyof AccountAsset, "balance">>, TesseractReferenceParam {
    asset_id: Identifier | Hex;
}
interface AccountKeyRequestParam extends IdentifierParam<Identifier | Hex>, TesseractReferenceParam {
    key_id: number;
    pending?: boolean;
}
interface InteractionSignature extends IdentifierParam<Identifier | Hex> {
    signature: Hex;
    key_id: number;
}
interface ExecuteRequestParam {
    interaction: Hex;
    signatures: InteractionSignature[];
}
interface InteractionRequestParam extends ResponseModifierParam<Exclude<keyof Interaction, "hash" | "status" | "interaction">> {
    hash: Hex;
}
export interface NetworkActionApi {
    "moi.Protocol": ApiMethod<[option?: ProtocolRequestParam]>;
    "moi.Simulate": ApiMethod<[param: SimulateRequestParam], Simulate>;
    "moi.Account": ApiMethod<[param: AccountRequestParam]>;
    "moi.Tesseract": ApiMethod<[param: TesseractRequestParam]>;
    "moi.Logic": ApiMethod<[param: LogicRequestParam]>;
    "moi.LogicStorage": ApiMethod<[param: LogicStorageRequestParam], Hex>;
    "moi.Asset": ApiMethod<[param: AssetRequestParam]>;
    "moi.LogicMessage": ApiMethod<[param: LogicMessageRequestParam], LogicMessage[]>;
    "moi.AccountAsset": ApiMethod<[param: AccountAssetRequestParam]>;
    "moi.AccountKey": ApiMethod<[param: AccountKeyRequestParam], AccountKey>;
    "moi.Execute": ApiMethod<[param: ExecuteRequestParam], Hex>;
    "moi.Interaction": ApiMethod<[param: InteractionRequestParam]>;
    "moi.Subscribe": ApiMethod<[event: string, params?: unknown], string>;
    "moi.Unsubscribe": ApiMethod<[subscription: string], boolean>;
}
/**
 * The `NetworkMethod` type is used to extract the method names from the `NetworkActionApi`.
 */
export type NetworkMethod = keyof NetworkActionApi;
/**
 * The `MethodParams` type is used to extract the parameters of a method from the `NetworkActionApi`.
 */
export type MethodParams<T extends NetworkMethod> = T extends NetworkMethod ? NetworkActionApi[T]["params"] : any[];
/**
 * The `MethodResponse` type is used to extract the response of a method from the `NetworkActionApi`.
 */
export type MethodResponse<T extends string> = T extends NetworkMethod ? NetworkActionApi[T]["response"] : any;
export {};
//# sourceMappingURL=moi-execution-api.d.ts.map