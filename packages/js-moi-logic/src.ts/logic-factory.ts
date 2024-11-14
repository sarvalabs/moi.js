import { LogicManifest, ManifestCoder } from "js-moi-manifest";
import { InteractionResponse, LogicPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { LogicIxObject, LogicIxResponse } from "../types/interaction";
import { LogicBase } from "./logic-base";
import { RoutineOption } from "./routine-options";

/**
 * This class represents a factory for deploying logic.
 */
export class LogicFactory extends LogicBase {
    private manifest: LogicManifest.Manifest;
    private encodedManifest: string;

    constructor(manifest: LogicManifest.Manifest, signer: Signer) {
        super(manifest, signer);
        this.manifest = manifest;
        this.encodedManifest = ManifestCoder.encodeManifest(manifest);
    }

    /**
     * Creates the payload for the logic interaction object.
     * 
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicPayload {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name
        } as LogicPayload;

        if(ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(
                payload.callsite, 
                ...ixObject.arguments,
            );
        }

        return payload;
    }

    /**
     * Processes the result of a logic interaction response.
     * 
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<string>} The processed logic interaction result.
     */
    protected async processResult(response: LogicIxResponse, timeout?: number): Promise<string> {
        try {
            const result = await response.result(timeout);

            const error = ManifestCoder.decodeException(result[0].error);
            
            if (error != null) {
                ErrorUtils.throwError(error.error, ErrorCode.CALL_EXCEPTION, { cause: error });
            }

            return result[0].logic_id ? result[0].logic_id : "";
        } catch(err) {
            throw err;
        }
    }

    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     * 
     * @returns {string} The encoded manifest.
     */
    public getEncodedManifest(): string {
        return this.encodedManifest;
    }

    /**
     * Deploys a logic.
     * 
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    public deploy(builderName: string, ...args: [...any, option?: RoutineOption]): Promise<InteractionResponse> {
        const builder = Object.values(this.manifest.elements)
        .find(element => {
            if(element.kind === "routine"){
                const routine = element.data as LogicManifest.Routine;
                return routine.kind === "deploy" && 
                builderName === routine.name;
            }
            return false;
        });

        if(builder) {
            const builderRoutine = builder.data as LogicManifest.Routine;

            const argsLen = args.at(-1) && args.at(-1) instanceof RoutineOption ? args.length - 1 : args.length;

            
            if(builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                ErrorUtils.throwError(
                    "One or more required arguments are missing.",
                    ErrorCode.MISSING_ARGUMENT
                );
            }
            
            return this.createIxObject(builderRoutine, ...args).send();
        }

        ErrorUtils.throwError(
            "Invalid builder name, builder not found!",
            ErrorCode.INVALID_ARGUMENT
        );
    }
}
