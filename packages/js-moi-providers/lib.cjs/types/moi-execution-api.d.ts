import type { Account, Address, Hex, Logic, NetworkInfo, ResponseModifierParam, Simulate, Tesseract, TesseractReferenceParam } from "js-moi-utils";
export type ApiMethod<TParams extends any[], TResponse = any> = {
    params: TParams;
    response: TResponse;
};
interface IdentifierParam<TValue> {
    identifier: TValue;
}
interface LogicStorageParam {
    logic_id: Hex;
    storage_id: Hex;
    address?: Address;
}
export interface NetworkActionApi {
    "moi.Protocol": ApiMethod<[option?: ResponseModifierParam<keyof NetworkInfo>]>;
    "moi.Simulate": ApiMethod<[param: {
        interaction: Hex;
    } & TesseractReferenceParam], Simulate>;
    "moi.Account": ApiMethod<[param: IdentifierParam<Address> & ResponseModifierParam<Exclude<keyof Account, "metadata">> & TesseractReferenceParam]>;
    "moi.Tesseract": ApiMethod<[param: Required<TesseractReferenceParam> & ResponseModifierParam<Exclude<keyof Tesseract, "hash" | "tesseract">>]>;
    "moi.Logic": ApiMethod<[param: IdentifierParam<Address> & ResponseModifierParam<Exclude<keyof Logic, "metadata">>]>;
    "moi.LogicStorage": ApiMethod<[param: LogicStorageParam & TesseractReferenceParam], Hex>;
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