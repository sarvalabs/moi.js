import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { LogicPayload, Options } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, defineReadOnly } from "js-moi-utils";
import { LogicIxObject, LogicIxResponse } from "../types/interaction";
import { Routines } from "../types/logic";
import { LogicDescriptor } from "./logic-descriptor";
import { RoutineOption } from "./routine-options";
import { EphemeralState, PersistentState } from "./state";

/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export class LogicDriver<T extends Record<string, (...args: any) => any> = any> extends LogicDescriptor {
    public readonly routines: Routines<T> = {} as Routines<T>;
    public readonly persistentState: PersistentState;
    public readonly ephemeralState: EphemeralState;

    constructor(logicId: string, manifest: LogicManifest.Manifest, arg: Signer) {
        super(logicId, manifest, arg)
        this.createState();
        this.createRoutines();
    }

    /**
     * Creates the persistent and ephemeral states for the logic driver, 
     if available in logic manifest.
     */
    private createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();

        if(hasPersistance) {
            const persistentState = new PersistentState(this, this.provider);
            defineReadOnly(this, "persistentState", persistentState)
        }

        if(hasEphemeral) {
            const ephemeralState = new EphemeralState(this, this.provider);
            defineReadOnly(this, "ephemeralState", ephemeralState)
        }
    }

    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines() {
        const routines = {};

        this.manifest.elements.forEach((element: LogicManifest.Element) => {
            if (element.kind !== "routine") {
                return;
            }

            const routine = element.data as LogicManifest.Routine;

            if (!["invoke", "enlist"].includes(routine.kind)) {
                return;
            }

            routines[routine.name] = async (...params: [...args: any[], options: RoutineOption | undefined]) => {
                const argsLen =
                    params.at(-1) && params.at(-1) instanceof RoutineOption
                        ? params.length - 1
                        : params.length;

                if (routine.accepts && argsLen < routine.accepts.length) {
                    ErrorUtils.throwError(
                        "One or more required arguments are missing.",
                        ErrorCode.INVALID_ARGUMENT
                    );
                }

                const ixObject = this.createIxObject(routine, ...params);

                if (!this.isMutableRoutine(routine)) {
                    return await ixObject.unwrap();
                }

                return await ixObject.send();
            };

            routines[routine.name].isMutable = (): boolean => {
                return this.isMutableRoutine(routine)
            }

            routines[routine.name].accepts = (): LogicManifest.TypeField[] | null => {
                return routine.accepts ? routine.accepts : null
            }

            routines[routine.name].returns = (): LogicManifest.TypeField[] | null => {
                return routine.returns ? routine.returns : null
            }
        })

        defineReadOnly(this, "routines", routines as Routines<T>);
    }

    /**
     * Checks if a routine is mutable based on its name.
     * 
     * @param {string} routine - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine(routine: LogicManifest.Routine): boolean {
        return ["persistent", "ephemeral"].includes(routine.mode);
    }

    /**
     * Creates the logic payload from the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload = {
            logic_id: this.getLogicId().string(),
            callsite: ixObject.routine.name,
        } as LogicPayload

        if(ixObject.routine.accepts && 
        Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(
                ixObject.routine.name, 
                ...ixObject.arguments
            );
        }

        return payload;
    }

    /**
     * Processes the logic interaction result and returns the decoded data or 
     error, if available.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<unknown>} A promise that resolves to the 
     logic interaction result or null.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<unknown> {
        try {
            const result = await response.result(timeout);


            const error = ManifestCoder.decodeException(result[0].error);

            if (error != null) {
                ErrorUtils.throwError(error.error, ErrorCode.CALL_EXCEPTION, { cause: error });
            }

            return this.manifestCoder.decodeOutput(response.routine_name, result[0].outputs)
        } catch(err) {
            throw err;
        }
    }
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
export const getLogicDriver = async <T extends Record<string, (...args: any) => any>>(logicId: string, signer: Signer, options?: Options): Promise<LogicDriver<T>> => {
    const manifest = await signer.getProvider().getLogicManifest(logicId, "JSON", options);

    if (typeof manifest !== "object") {
        ErrorUtils.throwError(
            "Invalid logic manifest",
            ErrorCode.INVALID_ARGUMENT
        );
    }

    return new LogicDriver<T>(logicId, manifest, signer);
}