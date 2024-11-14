import { ManifestCoder } from "js-moi-manifest";
import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { LogicBase } from "./logic-base";
import { RoutineOption } from "./routine-options";
/**
 * This class represents a factory for deploying logic.
 */
export class LogicFactory extends LogicBase {
    manifest;
    encodedManifest;
    constructor(manifest, signer) {
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
    createPayload(ixObject) {
        const payload = {
            manifest: this.encodedManifest,
            callsite: ixObject.routine.name
        };
        if (ixObject.routine.accepts && Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(payload.callsite, ...ixObject.arguments);
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
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            const error = ManifestCoder.decodeException(result[0].error);
            if (error != null) {
                ErrorUtils.throwError(error.error, ErrorCode.CALL_EXCEPTION, { cause: error });
            }
            return result[0].logic_id ? result[0].logic_id : "";
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
     * @param {string} builderName - The name of the builder routine.
     * @param {any[]} args - Optional arguments for the deployment.
     * @returns {LogicIxRequest} The logic interaction request object.
     * @throws {Error} If the builder routine is not found or if there are missing arguments.
     */
    deploy(builderName, ...args) {
        const builder = Object.values(this.manifest.elements)
            .find(element => {
            if (element.kind === "routine") {
                const routine = element.data;
                return routine.kind === "deploy" &&
                    builderName === routine.name;
            }
            return false;
        });
        if (builder) {
            const builderRoutine = builder.data;
            const argsLen = args.at(-1) && args.at(-1) instanceof RoutineOption ? args.length - 1 : args.length;
            if (builderRoutine.accepts && (argsLen < Object.keys(builderRoutine.accepts).length)) {
                ErrorUtils.throwError("One or more required arguments are missing.", ErrorCode.MISSING_ARGUMENT);
            }
            return this.createIxObject(builderRoutine, ...args).send();
        }
        ErrorUtils.throwError("Invalid builder name, builder not found!", ErrorCode.INVALID_ARGUMENT);
    }
}
//# sourceMappingURL=logic-factory.js.map