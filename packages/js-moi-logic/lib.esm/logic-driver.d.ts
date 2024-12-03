import { LogicManifest } from "js-moi-manifest";
import { LogicActionPayload, Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { Routines } from "../types/logic";
import { LogicDescriptor } from "./logic-descriptor";
import { EphemeralState, PersistentState } from "./state";
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export declare class LogicDriver<T extends Record<string, (...args: any) => any> = any> extends LogicDescriptor {
    readonly routines: Routines<T>;
    readonly persistentState: PersistentState;
    readonly ephemeralState: EphemeralState;
    constructor(logicId: string, manifest: LogicManifest.Manifest, arg: Signer);
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    private createState;
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines;
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine;
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicActionPayload} The logic action payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicActionPayload;
    /**
     * Processes the logic interaction result and returns the decoded data or
     error, if available.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult | null>} A promise that resolves to the
     logic interaction result or null.
     */
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult>;
}
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export declare const getLogicDriver: <T extends Record<string, (...args: any) => any>>(logicId: string, signer: Signer, options?: Options) => Promise<LogicDriver<T>>;
//# sourceMappingURL=logic-driver.d.ts.map