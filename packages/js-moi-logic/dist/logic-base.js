"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicBase = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const element_descriptor_1 = __importDefault(require("./element-descriptor"));
/**
 * This abstract class extends the ElementDescriptor class and serves as a base
 class for logic-related operations.
 * It defines common properties and abstract methods that subclasses should implement.
 */
class LogicBase extends element_descriptor_1.default {
    signer;
    manifestCoder;
    constructor(manifest, signer) {
        super(manifest.elements);
        this.signer = signer;
        this.manifestCoder = new js_moi_manifest_1.ManifestCoder(this.elements, this.classDefs);
    }
    /**
     * Returns the logic ID associated with the LogicBase instance.
     *
     * @returns {string} The logic ID.
     */
    getLogicId() {
        return "";
    }
    /**
     * Updates the signer or establishes a connection with a new signer.
     *
     * @param {Signer} signer - The updated signer object or the new signer object to connect.
     */
    connect(signer) {
        this.signer = signer;
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
    async executeRoutine(ixObject, type, option) {
        const processedArgs = this.processArguments(ixObject, type, option);
        if (this.getIxType() !== js_moi_utils_1.IxType.LOGIC_DEPLOY && !this.getLogicId()) {
            js_moi_utils_1.ErrorUtils.throwError("This logic object doesn\'t have address set yet, please set an address first.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        switch (processedArgs.type) {
            case "call":
                return this.signer.call(processedArgs.params)
                    .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, {
                            ...response,
                            routine_name: ixObject.routine.name
                        })
                    };
                }).catch((err) => {
                    throw err;
                });
            case "estimate":
                return this.signer.estimateFuel(processedArgs.params);
            case "send":
                return this.signer.sendInteraction(processedArgs.params)
                    .then((response) => {
                    return {
                        ...response,
                        result: this.processResult.bind(this, {
                            ...response,
                            routine_name: ixObject.routine.name
                        })
                    };
                }).catch((err) => {
                    throw err;
                });
            default:
                break;
        }
        js_moi_utils_1.ErrorUtils.throwError('Method "' + processedArgs.type + '" not supported.', js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    /**
     * Processes the interaction arguments and returns the processed arguments object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @param {any[]} args - The interaction arguments.
     * @returns {any} The processed arguments object.
     * @throws {Error} Throws an error if there are missing arguments or missing fuel information.
     */
    processArguments(ixObject, type, option) {
        return {
            type,
            params: {
                sender: this.signer.getAddress(),
                type: this.getIxType(),
                fuel_price: option.fuelPrice,
                fuel_limit: option.fuelLimit,
                payload: ixObject.createPayload()
            }
        };
    }
    /**
     * Creates a logic interaction request object based on the given interaction object.
     *
     * @param {LogicIxObject} ixObject - The interaction object.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxRequest(ixObject) {
        const unwrap = async () => {
            const ix = await ixObject.call();
            const result = await ix.result();
            if (result.error) {
                throw result.error;
            }
            return result.output;
        };
        return {
            unwrap,
            call: ixObject.call.bind(ixObject),
            send: ixObject.send.bind(ixObject),
            estimateFuel: ixObject.estimateFuel.bind(ixObject)
        };
    }
    /**
     * Creates a logic interaction request object with the specified routine and arguments.
     *
     * @param {LogicManifest.Routine} routine - The routine for the logic interaction request.
     * @param {any[]} args - The arguments for the logic interaction request.
     * @returns {LogicIxRequest} The logic interaction request object.
     */
    createIxObject(routine, ...args) {
        const DEFAULT_FUEL_PRICE = 1;
        const DEFAULT_FUEL_LIMIT = 1000;
        const option = args.at(-1) && typeof args.at(-1) === "object" ? args.pop() : {};
        const ixObject = {
            routine: routine,
            arguments: args
        };
        ixObject.estimateFuel = () => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= DEFAULT_FUEL_LIMIT;
            return this.executeRoutine(ixObject, "estimate", option);
        };
        ixObject.call = async () => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= await ixObject.estimateFuel();
            return this.executeRoutine(ixObject, "call", option);
        };
        ixObject.send = async () => {
            option.fuelPrice ??= DEFAULT_FUEL_PRICE;
            option.fuelLimit ??= await ixObject.estimateFuel();
            return this.executeRoutine(ixObject, "send", option);
        };
        ixObject.createPayload = () => {
            return this.createPayload(ixObject);
        };
        return this.createIxRequest(ixObject);
    }
}
exports.LogicBase = LogicBase;
