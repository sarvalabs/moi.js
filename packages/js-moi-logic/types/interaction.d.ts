import { LogicManifest } from "js-moi-manifest";
import { InteractionCallResponse, InteractionObject, InteractionResponse, LogicPayload } from "js-moi-providers";

export interface LogicIxObject {
    routine: LogicManifest.Routine;
    arguments: any[];

    call(...args: any[]): Promise<InteractionCallResponse>;
    send(...args: any[]): Promise<InteractionResponse>;
    estimateFuel(...args: any[]): Promise<number|bigint>;
    createPayload(): LogicPayload;
}

export interface LogicIxResponse extends InteractionResponse {
    routine_name: string;
}

export interface LogicIxArguments {
    type: string;
    params: InteractionObject;
}
