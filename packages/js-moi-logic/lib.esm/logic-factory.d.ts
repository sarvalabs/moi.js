import { LogicManifest } from "js-moi-manifest";
import { InteractionResponse, LogicDeployPayload } from "js-moi-providers";
import { Signer } from "js-moi-signer";
import { LogicIxObject, LogicIxResponse, LogicIxResult } from "../types/interaction";
import { LogicBase } from "./logic-base";
import { RoutineOption } from "./routine-options";
/**
 * This class represents a factory for deploying logic.
 */
export declare class LogicFactory extends LogicBase {
    private manifest;
    private encodedManifest;
    constructor(manifest: LogicManifest.Manifest, signer: Signer);
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    protected createPayload(ixObject: LogicIxObject): LogicDeployPayload;
    /**
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    protected processResult(response: LogicIxResponse, timeout?: number): Promise<LogicIxResult>;
    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     *
     * @returns {string} The encoded manifest.
     */
    getEncodedManifest(): string;
    /**
     * Deploys a logic.
     *
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(builderName: string, ...args: [...any, option?: RoutineOption]): Promise<InteractionResponse>;
}
//# sourceMappingURL=logic-factory.d.ts.map