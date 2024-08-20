"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogicDriver = exports.LogicDriver = void 0;
const js_moi_signer_1 = require("js-moi-signer");
const js_moi_utils_1 = require("js-moi-utils");
const logic_descriptor_1 = require("./logic-descriptor");
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
                const argsLen = params.at(-1) && typeof params.at(-1) === "object"
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
     * @param {string} routineName - The name of the routine.
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
            const calldata = this.manifestCoder.encodeArguments(ixObject.routine.accepts, ixObject.arguments);
            payload.calldata = (0, js_moi_utils_1.hexToBytes)(calldata);
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
            const routine = this.getRoutineElement(response.routine_name);
            const result = await response.result(timeout);
            return this.manifestCoder.decodeOutput(result[0].outputs, routine.data["returns"]);
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
 * @param {Signer | AbstractProvider} signerOrProvider - The instance of the `Signer` or `AbstractProvider`.
 * @param {Options} options - The custom tesseract options for retrieving
 *
 * @returns {Promise<LogicDriver>} A promise that resolves to a LogicDriver instance.
 */
const getLogicDriver = async (logicId, signerOrProvider, options) => {
    const provider = signerOrProvider instanceof js_moi_signer_1.Signer ? signerOrProvider.getProvider() : signerOrProvider;
    const manifest = await provider.getLogicManifest(logicId, "JSON", options);
    if (typeof manifest !== "object") {
        js_moi_utils_1.ErrorUtils.throwError("Invalid logic manifest", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    // below check added for type safety
    return signerOrProvider instanceof js_moi_signer_1.Signer
        ? new LogicDriver(logicId, manifest, signerOrProvider)
        : new LogicDriver(logicId, manifest, signerOrProvider);
};
exports.getLogicDriver = getLogicDriver;
//# sourceMappingURL=logic-driver.js.map