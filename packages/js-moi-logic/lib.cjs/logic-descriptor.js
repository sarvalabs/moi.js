"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const yaml_1 = require("yaml");
/**
 * The `LogicDescriptor` class represents a logic descriptor.
 *
 * It provides methods to get information about the logic and its elements.
 */
class LogicDescriptor extends js_moi_manifest_1.ElementDescriptor {
    logicId;
    manifest;
    coder;
    state = new Map();
    constructor(manifest, logicId) {
        if (manifest == null) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Manifest is required.", "manifest", manifest);
        }
        super(manifest.elements);
        this.manifest = manifest;
        this.logicId = logicId;
        for (const element of this.manifest.elements) {
            if (element.kind === js_moi_utils_1.ElementType.State) {
                this.state.set(element.data.mode, element.ptr);
            }
        }
    }
    setLogicId(logicId) {
        this.logicId = logicId;
    }
    /**
     * Retrieves the engine from the logic manifest.
     *
     * @returns The engine specified in the logic manifest.
     */
    getEngine() {
        return this.manifest.engine;
    }
    /**
     * Retrieves the syntax from the logic manifest.
     *
     * @returns The syntax specified in the logic manifest.
     */
    getSyntax() {
        return this.manifest.syntax;
    }
    /**
     * Retrieves the logic ID.
     *
     * @returns The logic ID.
     *
     * @throws Will throw an error if the logic ID is not found.
     */
    async getLogicId() {
        if (this.logicId == null) {
            js_moi_utils_1.ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return this.logicId;
    }
    /**
     * Checks if the logic is ephemeral.
     *
     * @returns `true` if the logic is ephemeral, `false` otherwise.
     */
    isEphemeral() {
        return this.state.has(js_moi_utils_1.LogicState.Ephemeral);
    }
    /**
     * Checks if the logic is persistent.
     *
     * @returns `true` if the logic is persistent, `false` otherwise.
     */
    isPersistent() {
        return this.state.has(js_moi_utils_1.LogicState.Persistent);
    }
    /**
     * Retrieves the instance manifest coder.
     *
     * @returns The manifest coder.
     */
    getManifestCoder() {
        if (this.coder == null) {
            this.coder = new js_moi_manifest_1.ManifestCoder(this.manifest);
        }
        return this.coder;
    }
    getManifest(format) {
        switch (format) {
            case js_moi_manifest_1.ManifestCoderFormat.JSON:
                return this.manifest;
            case js_moi_manifest_1.ManifestCoderFormat.YAML:
                return (0, yaml_1.stringify)(this.manifest);
            case js_moi_manifest_1.ManifestCoderFormat.POLO:
                return js_moi_manifest_1.ManifestCoder.encodeManifest(this.manifest);
            default:
                js_moi_utils_1.ErrorUtils.throwArgumentError(`Unsupported format: ${format}`, "format", format);
        }
    }
    /**
     * Retrieves the logic state element.
     *
     * @param state - The logic state to retrieve the element for.
     * @returns The logic state element.
     *
     * @throws Will throw an error if the state is not found.
     */
    getStateElement(state) {
        const ptr = this.state.get(state);
        if (ptr == null) {
            js_moi_utils_1.ErrorUtils.throwError(`State "${state}" not found in logic.`, js_moi_utils_1.ErrorCode.NOT_FOUND);
        }
        const element = this.getElement(ptr);
        if (element.kind !== js_moi_utils_1.ElementType.State) {
            js_moi_utils_1.ErrorUtils.throwError(`Element is not a state: ${state}`, js_moi_utils_1.ErrorCode.UNKNOWN_ERROR);
        }
        return element;
    }
}
exports.LogicDescriptor = LogicDescriptor;
//# sourceMappingURL=logic-descriptor.js.map