import { ManifestCoder } from "js-moi-manifest";
import { ErrorCode, ErrorUtils, RoutineType } from "js-moi-utils";
import { LogicBase } from "./logic-base";
import { RoutineOption } from "./routine-options";
/**
 * This class represents a factory for deploying logic.
 */
export class LogicFactory extends LogicBase {
    encodedManifest;
    constructor(manifest, signer) {
        super(manifest, signer);
        this.encodedManifest = ManifestCoder.encodeManifest(manifest);
    }
    /**
     * Creates the payload for the logic interaction object.
     *
     * @param {LogicIxObject} ixObject - The logic interaction object.
     * @returns {LogicDeployPayload} The logic deploy payload.
     */
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name,
            calldata: "",
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(payload.callsite, ...ixObject.arguments);
        }
        return payload;
    }
    createOperationPayload(callsite, args) {
        throw new Error("Method not implemented.");
    }
    /**
     * Processes the result of a logic interaction response.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult>} The processed logic interaction result.
     */
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            return {
                logic_id: result[0].logic_id ? result[0].logic_id : "",
                error: ManifestCoder.decodeException(result[0].error),
            };
        }
        catch (err) {
            throw err;
        }
    }
    /**
     * Returns the POLO encoded manifest in hexadecimal format.
     *
     * @returns {string} The encoded manifest.
     */
    getEncodedManifest() {
        return this.encodedManifest;
    }
    /**
     * Deploys a logic.
     *
     * @param {string} callsite - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(callsite, ...args) {
        const element = this.getRoutineElement(callsite);
        if (element.data.kind !== RoutineType.Deploy) {
            ErrorUtils.throwError("The specified routine is not a deploy routine.", ErrorCode.INVALID_ARGUMENT);
        }
        const hasOption = args.at(-1) instanceof RoutineOption;
        const callsiteArgs = hasOption ? args.slice(0, -1) : args;
        const option = hasOption ? args.at(-1) : undefined;
        if (element.data.accepts.length !== callsiteArgs.length) {
            const sign = `${element.data.name}(${element.data.accepts.map((arg) => arg.label + ": " + arg.type).join(", ")})`;
            ErrorUtils.throwArgumentError(`Invalid number of arguments for routine: ${sign}`, "args", ErrorCode.INVALID_ARGUMENT);
        }
        return this.createIxObject(element.data, callsiteArgs, option);
    }
    createIxObject(data, arg1, option) {
        throw new Error("Method not implemented.");
    }
}
//# sourceMappingURL=logic-factory.js.map