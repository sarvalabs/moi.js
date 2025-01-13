import type { Account, Address, Hex, NetworkInfo, ResponseModifierParam, Simulate, TesseractReferenceParam } from "js-moi-utils";

export type ApiMethod<TParams extends any[], TResponse = any> = {
    params: TParams;
    response: TResponse;
};

interface IdentifierParam<TValue> {
    identifier: TValue;
}

export interface NetworkActionApi {
    "moi.Protocol": ApiMethod<[option?: ResponseModifierParam<keyof NetworkInfo>]>;
    "moi.Simulate": ApiMethod<[param: { interaction: Hex } & TesseractReferenceParam], Simulate>;
    "moi.Account": ApiMethod<[param: IdentifierParam<Address> & ResponseModifierParam<Exclude<keyof Account, "metadata">> & TesseractReferenceParam]>;
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
