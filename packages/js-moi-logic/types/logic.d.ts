import { LogicManifest } from "js-moi-manifest";
import { InteractionCallResponse, InteractionResponse } from "js-moi-providers";

export interface LogicIxRequest {
    call: () => Promise<InteractionCallResponse>;
    send: () => Promise<InteractionResponse>;
    estimateFuel: () => Promise<number | bigint>;

    /**
     * Call the logic interaction request and returns the result.
     * @returns {Promise<any>} a promise that resolves to the result of the logic interaction request.
     * @throws {Error} if the logic interaction request fails.
     */
    unwrap: () => Promise<any>;
}

export interface RoutineRequestOption {
    /**
     * The fuel price for the logic interaction request.
     */
    fuelPrice?: number;

    /**
     * The fuel limit for the logic interaction request.
     */
    fuelLimit?: number;
}

export interface Routine<T extends (...args: any[]) => any> {
    /**
     * Executes the logic interaction request with the specified routine and arguments.
     * @param {...any[]} args - The arguments for the logic interaction request.
     * @param {RoutineRequestOption} option - The option for the logic interaction request.
     * @returns {Promise<any>} a promise that resolves to the result of the logic interaction request.
     */
    (...args: [...Parameters<T>, option?: RoutineRequestOption]): ReturnType<T> | Promise<InteractionResponse>;
    isMutable: () => boolean;
    accepts: () => LogicManifest.TypeField[] | null;
    returns: () => LogicManifest.TypeField[] | null;
}

export type Routines<T extends Record<string, (...args: any[]) => any>> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? Routine<T[K]> : never;
}

export interface CallSite {
    ptr: number,
    kind: string
}

export interface MethodDef {
    ptr: number;
    class: string;
}
