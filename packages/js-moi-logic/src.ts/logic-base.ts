import { ElementDescriptor, LogicManifest, ManifestCoder } from "js-moi-manifest";
import type { AbstractProvider, LogicActionPayload, LogicDeployPayload } from "js-moi-providers";
import { CallorEstimateIxObject, InteractionCallResponse, InteractionObject, InteractionResponse } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils, OpType } from "js-moi-utils";
import { LogicIxArguments, LogicIxObject, LogicIxResponse } from "../types/interaction";
import { LogicIxRequest } from "../types/logic";
import { LogicId } from "./logic-id";
import { RoutineOption } from "./routine-options";

/**
 * The default fuel price used for logic interactions.
 */
const DEFAULT_FUEL_PRICE = 1;

/**
 * This abstract class extends the ElementDescriptor class and serves as a base 
 * class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
export abstract class LogicBase extends ElementDescriptor {
    protected signer?: Signer;
    protected provider: AbstractProvider;
    protected manifestCoder: ManifestCoder;
    

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest.elements)
        this.manifestCoder = new ManifestCoder(manifest);
        this.connect(signer)
    }

    // abstract methods to be implemented by subclasses

    protected abstract createPayload(ixObject: LogicIxObject): LogicDeployPayload | LogicActionPayload;
    
    // TODO: Logic Call Result should be handled seperately
    protected abstract processResult(response: LogicIxResponse, timeout?: number): Promise<unknown | null>;

    /**
     * Returns the logic ID associated with the LogicBase instance.
     * 
     * @returns {string} The logic ID.
     */
    protected getLogicId(): LogicId {
        return new LogicId("")
    }

    /**
     * Returns the interaction type based on the routine kind.
     * 
     * @returns {OpType} The interaction type.
     */
    protected getTxType(kind: string): OpType.LOGIC_DEPLOY | OpType.LOGIC_INVOKE |
    OpType.LOGIC_ENLIST {
        switch(kind){
            case "deploy":
                return OpType.LOGIC_DEPLOY;
            case "invoke":
                return OpType.LOGIC_INVOKE;
            case "enlist":
                return OpType.LOGIC_ENLIST;
            default:
                throw new Error("Unsupported routine kind!");
        }
    }

    /**
     * Updates the signer and provider instances for the LogicBase instance.
     * 
     * @param {Signer | AbstractProvider} signer -  The signer or provider instance.
     */
    public connect(signer: Signer): void {
        if (signer instanceof Signer) {
            this.signer = signer;
            this.provider = signer.getProvider();
            return;
        }

        this.provider = signer;
    }

    /**
     * Executes a routine with the given arguments and returns the interaction response.
     * 
     * @param {any} ixObject - The interaction object.
     * @param {any[]} args - The arguments for the routine.
     * @returns {Promise<InteractionResponse>} A promise that resolves to the 
     * interaction response.
     * @throws {Error} if the provider is not initialized within the signer, 
     * if the logic id is not defined, if the method type is unsupported,
     * or if the sendInteraction operation fails.
     */
    protected async executeRoutine(ixObject: LogicIxObject, method: string, option: RoutineOption): Promise<InteractionCallResponse | number | bigint | InteractionResponse> {
        if (this.getTxType(ixObject.routine.kind) !== OpType.LOGIC_DEPLOY && !this.getLogicId()) {
            ErrorUtils.throwError(
                "This logic object doesn't have logic id assigned yet, please assign an logic id.",
                ErrorCode.NOT_INITIALIZED
            );
        }

        const { type, params } = this.processArguments(ixObject, method, option);

        switch (type) {
            case "call": {
                const response = await this.provider.call(params as CallorEstimateIxObject);

                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            case "estimate": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError(
                        "Mutating routine calls require a signer to be initialized.",
                        ErrorCode.NOT_INITIALIZED
                    );
                }
                return this.provider.estimateFuel(params as CallorEstimateIxObject);
            }
            case "send": {
                if (!this.signer?.isInitialized()) {
                    ErrorUtils.throwError(
                        "Mutating routine calls require a signer to be initialized.",
                        ErrorCode.NOT_INITIALIZED
                    );
                }

                const response = await this.signer.sendInteraction(params);

                return {
                    ...response,
                    result: this.processResult.bind(this, {
                        ...response,
                        routine_name: ixObject.routine.name,
                    }),
                };
            }
            default:
              break;
        }

        ErrorUtils.throwError('Method "' + type + '" not supported.',ErrorCode.UNSUPPORTED_OPERATION);
    }

    /**
     * Processes the interaction arguments and returns the processed arguments object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    protected processArguments(ixObject: LogicIxObject, type: string, option: RoutineOption): LogicIxArguments {
        const params: InteractionObject = {
            sender: option.sender ?? this.signer?.getAddress(),
            fuel_price: option.fuelPrice,
            fuel_limit: option.fuelLimit,
            nonce: option.nonce,
            ix_operations: []
        }

        const opType = this.getTxType(ixObject.routine.kind);
        const payload = ixObject.createPayload();

        switch (opType) {
            case OpType.LOGIC_DEPLOY:
                params.ix_operations = [
                    {
                        type: OpType.LOGIC_DEPLOY,
                        payload: payload as LogicDeployPayload,
                    },
                ];
                break;
            case OpType.LOGIC_INVOKE:
            case OpType.LOGIC_ENLIST:
                params.ix_operations = [
                    {
                        type: opType,
                        payload: payload as LogicActionPayload,
                    },
                ];
                break;
            default:
                ErrorUtils.throwError(
                    `Unsupported operation type: ${opType}`,
                    ErrorCode.UNSUPPORTED_OPERATION
                );
        }

        return { type, params }
    }

    /**
     * Creates a logic interaction request object based on the given interaction object.
     * 
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    protected createIxRequest(ixObject: LogicIxObject): LogicIxRequest {
        const unwrap = async () => {
            const ix = await ixObject.call();

            return await ix.result();
        }

        return {
            unwrap,
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateFuel: ixObject.estimateFuel.bind(ixObject)
        }
    }

    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     * 
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    protected createIxObject(routine: LogicManifest.Routine, ...args: any[]): LogicIxRequest {
        const option = args.at(-1) && args.at(-1) instanceof RoutineOption ? args.pop() : {};

        const ixObject: LogicIxObject = {
            routine: routine,
            arguments: args
        } as LogicIxObject

        ixObject.call = async (): Promise<InteractionCallResponse> => {
            return this.executeRoutine(ixObject, "call", option) as Promise<InteractionCallResponse>
        }

        ixObject.send = async (): Promise<InteractionResponse> => {
            option.fuelLimit = option.fuelLimit ?? await ixObject.estimateFuel();
            option.fuelPrice = option.fuelPrice ?? DEFAULT_FUEL_PRICE;  

            return this.executeRoutine(ixObject, "send", option) as Promise<InteractionResponse>
        }
        
        ixObject.estimateFuel = (): Promise<number|bigint> => {
            return this.executeRoutine(ixObject, "estimate", option) as Promise<number | bigint>
        }

        ixObject.createPayload = (): LogicDeployPayload | LogicActionPayload => {
            return this.createPayload(ixObject)
        }

        return this.createIxRequest(ixObject);
    }
}


