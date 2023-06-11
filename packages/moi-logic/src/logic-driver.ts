import { ABICoder } from "moi-abi";
import { LogicPayload } from "moi-signer";
import { ErrorCode, ErrorUtils, IxType, LogicManifest } from "moi-utils";
import { JsonRpcProvider, Options } from "moi-providers";
import { Routine, Routines } from "../types/logic";
import { EphemeralState, PersistentState } from "./state";
import { LogicDescriptor } from "./logic-descriptor";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";

/**
 * LogicDriver
 * 
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
export class LogicDriver extends LogicDescriptor {
    public routines: Routines = {};
    public persistentState: PersistentState;
    public ephemeralState: EphemeralState;

    constructor(logicId: string, manifest: LogicManifest.Manifest, provider: JsonRpcProvider) {
        super(logicId, manifest, provider)
        this.createState();
        this.createRoutines();
    }

    /**
     * createState
     * 
     * Creates the persistent and ephemeral states for the logic driver, 
     if available in logic manifest.
     */
    private createState() {
        const [persistentStatePtr, persistentStateExists] = this.hasPersistentState()

        if(persistentStateExists) {
            this.persistentState = new PersistentState(
                this.logicId.hex(),
                this.elements.get(persistentStatePtr),
                this.abiCoder,
                this.provider
            )
        }
    }

    /**
     * createRoutines
     * 
     * Creates an interface for executing routines defined in the logic manifest.
     */
    private createRoutines() {
        this.manifest.elements.forEach((element: LogicManifest.Element) => {
            if(element.kind === "routine") {
                const routine = element.data as LogicManifest.Routine;

                if (routine.kind === "invokable") {
                    const routineName = this.normalizeRoutineName(routine.name)

                    // Create a routine execution function
                    this.routines[routineName] = ((args: any[] = []) => {
                        return this.createIxObject(routine, ...args);
                    }) as Routine;
    
                    // Define routine properties
                    this.routines[routineName].isMutable = (): boolean => {
                        return this.isMutableRoutine(routineName)
                    }
    
                    this.routines[routineName].accepts = (): LogicManifest.TypeField[] | null => {
                        return routine.accepts ? routine.accepts : null
                    }

                    this.routines[routineName].returns = (): LogicManifest.TypeField[] | null => {
                        return routine.returns ? routine.returns : null
                    }
                }
            }
        })
    }

    /**
     * isMutableRoutine
     * 
     * Checks if a routine is mutable based on its name.
     * 
     * @param {string} routineName - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    private isMutableRoutine(routineName: string): boolean {
        return routineName.endsWith("!");
    }

    /**
     * normalizeRoutineName
     * 
     * Normalizes a routine name by removing the exclamation mark if present.
     * 
     * @param {string} routineName - The routine name
     * @returns {string} The normalized routine name.
     */
    private normalizeRoutineName(routineName: string): string {
        if (this.isMutableRoutine(routineName)) {
            return routineName.slice(0, -1); // Remove the last character (exclamation mark)
        }

        return routineName; // If no exclamation mark, return the original string
    }

    /**
     * getIxType
     * 
     * Returns the interaction type for the logic driver.
     * 
     * @returns {IxType} The interaction type.
     */
    protected getIxType(): IxType {
        return IxType.LOGIC_INVOKE;
    }

    /**
     * createPayload
     * 
     * Creates the logic payload from the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload: any = {
            logic_id: this.getLogicId(),
            callsite: ixObject.routine.name,
        }

        if(ixObject.routine.accepts && 
        Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.abiCoder.encodeArguments(
                ixObject.routine.accepts, 
                ixObject.arguments
            );
        }

        return payload;
    }

    /**
     * processResult
     * 
     * Processes the logic interaction result and returns the decoded data or 
     error, if available.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult | null>} A promise that resolves to the 
     logic interaction result or null.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult | null> {
        try {
            const routine = this.getRoutineElement(response.routine_name)
            const result = await response.result(response.hash, timeout);
            const data = { 
                output: this.abiCoder.decodeOutput(
                    result.outputs,
                    routine.data["returns"]
                ), 
                error: ABICoder.decodeException(result.error) 
            };
    
            if(data.output || data.error) {
                return data
            }

            return null
        } catch(err) {
            throw err;
        }
    }
}

/**
 * getLogicDriver
 * 
 * Returns a logic driver instance based on the given logic id.
 * 
 * @param {string} logicId - The logic id of the logic.
 * @param {JsonRpcProvider} provider - The JSON-RPC provider.
 * @param {Options} options - The custom options for the logic driver. (optional)
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
export const getLogicDriver = async (logicId: string, provider: JsonRpcProvider, options?: Options): Promise<LogicDriver> => {
    try {
        const manifest = await provider.getLogicManifest(logicId, "JSON", options);

        if (typeof manifest === 'object') {
            return new LogicDriver(logicId, manifest, provider);
        }

        ErrorUtils.throwError(
            "Invalid logic manifest",
            ErrorCode.INVALID_ARGUMENT
        )
    } catch(err) {
        throw err;
    }
}