import type { Identifier } from "js-moi-identifiers";
import type { InteractionResponse } from "js-moi-providers";
import type { Signer, SignerIx } from "js-moi-signer";
import type { InteractionRequest, LogicManifest } from "js-moi-utils";
import type { AccessorBuilder } from "../state/accessor-builder";
import type { StateAccessorBuilder } from "../state/state-accessor-builder";
export interface LogicDriverOption {
    manifest: LogicManifest;
    signer: Signer;
    logicId?: Identifier;
}
export type CallsiteOption = Omit<Partial<SignerIx<InteractionRequest>>, "operations">;
type CallsiteResult = InteractionResponse | Record<any, any>;
export interface CallsiteCallback {
    <TRes extends CallsiteResult = any>(option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, arg11: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, arg11: any, arg12: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, arg11: any, arg12: any, arg13: any, option?: CallsiteOption): Promise<TRes>;
    <TRes extends CallsiteResult = any>(arg1: any, arg2: any, arg3: any, arg4: any, arg5: any, arg6: any, arg7: any, arg8: any, arg9: any, arg10: any, arg11: any, arg12: any, arg13: any, arg14: any, option?: CallsiteOption): Promise<TRes>;
}
export type LogicCallsites = Record<string, CallsiteCallback>;
export type StateAccessorFn = (builder: StateAccessorBuilder) => AccessorBuilder;
export {};
//# sourceMappingURL=index.d.ts.map