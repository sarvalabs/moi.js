"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const logic_descriptor_1 = require("./logic-descriptor");
const routine_options_1 = require("./routine-options");
const state_1 = require("./state");
/**
 * Represents a logic driver that serves as an interface for interacting with logics.
 */
class LogicDriver extends logic_descriptor_1.LogicDescriptor {
    routines = {};
    persistentState;
    ephemeralState;
    constructor(logicId, manifest, arg) {
        super(logicId, manifest, arg);
        this.createState();
        this.createRoutines();
    }
    /**
     * Creates the persistent and ephemeral states for the logic driver,
     if available in logic manifest.
     */
    createState() {
        const hasPersistance = this.stateMatrix.persistent();
        const hasEphemeral = this.stateMatrix.ephemeral();
        if (hasPersistance) {
            const persistentState = new state_1.PersistentState(this, this.provider);
            (0, js_moi_utils_1.defineReadOnly)(this, "persistentState", persistentState);
        }
        if (hasEphemeral) {
            const ephemeralState = new state_1.EphemeralState(this, this.provider);
            (0, js_moi_utils_1.defineReadOnly)(this, "ephemeralState", ephemeralState);
        }
    }
    /**
     * Creates an interface for executing routines defined in the logic manifest.
     */
    createRoutines() {
        const routines = {};
        this.manifest.elements.forEach((element) => {
            if (element.kind !== "routine") {
                return;
            }
            const routine = element.data;
            if (!["invoke", "enlist"].includes(routine.kind)) {
                return;
            }
            routines[routine.name] = async (...params) => {
                const argsLen = params.at(-1) && params.at(-1) instanceof routine_options_1.RoutineOption
                    ? params.length - 1
                    : params.length;
                if (routine.accepts && argsLen < routine.accepts.length) {
                    js_moi_utils_1.ErrorUtils.throwError("One or more required arguments are missing.", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
                }
                const ixObject = this.createIxObject(routine, ...params);
                if (!this.isMutableRoutine(routine)) {
                    return await ixObject.unwrap();
                }
                return await ixObject.send();
            };
            routines[routine.name].isMutable = () => {
                return this.isMutableRoutine(routine);
            };
            routines[routine.name].accepts = () => {
                return routine.accepts ? routine.accepts : null;
            };
            routines[routine.name].returns = () => {
                return routine.returns ? routine.returns : null;
            };
        });
        (0, js_moi_utils_1.defineReadOnly)(this, "routines", routines);
    }
    /**
     * Checks if a routine is mutable based on its name.
     *
     * @param {string} routine - The name of the routine.
     * @returns {boolean} True if the routine is mutable, false otherwise.
     */
    isMutableRoutine(routine) {
        return ["persistent", "ephemeral"].includes(routine.mode);
    }
    /**
     * Creates the logic payload from the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicPayload} The logic payload.
     */
    createPayload(ixObject) {
        const payload = {
            logic_id: this.getLogicId().string(),
            callsite: ixObject.routine.name,
        };
        if (ixObject.routine.accepts &&
            Object.keys(ixObject.routine.accepts).length > 0) {
            payload.calldata = this.manifestCoder.encodeArguments(ixObject.routine.name, ...ixObject.arguments);
        }
        return payload;
    }
    /**
     * Processes the logic interaction result and returns the decoded data or
     error, if available.
     *
     * @param {LogicIxResponse} response - The logic interaction response.
     * @param {number} timeout - The custom timeout for processing the result. (optional)
     * @returns {Promise<LogicIxResult | null>} A promise that resolves to the
     logic interaction result or null.
     */
    async processResult(response, timeout) {
        try {
            const result = await response.result(timeout);
            const error = js_moi_manifest_1.ManifestCoder.decodeException(result[0].error);
            if (error != null) {
                js_moi_utils_1.ErrorUtils.throwError(error.error, js_moi_utils_1.ErrorCode.CALL_EXCEPTION, { cause: error });
            }
            return this.manifestCoder.decodeOutput(response.routine_name, result[0].outputs);
        }
        catch (err) {
            throw err;
        }
    }
}
exports.LogicDriver = LogicDriver;
/**
 * Returns a logic driver instance based on the given logic id.
 *
 * @param {string} logicId - The logic id of the logic.
 * @param {Signer} signer - The signer instance for the logic driver.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
const getLogicDriver = async (logicId, signer, options) => {
    const manifest = await signer.getProvider().getLogicManifest(logicId, "JSON", options);
    if (typeof manifest !== "object") {
        js_moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    return new LogicDriver(logicId, manifest, signer);
};
exports.getLogicDriver = getLogicDriver;
//# sourceMappingURL=logic-driver.js.map