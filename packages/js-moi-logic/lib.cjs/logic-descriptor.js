"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDescriptor = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const yaml_1 = require("yaml");
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
    getEngine() {
        return this.manifest.engine;
    }
    getSyntax() {
        return this.manifest.syntax;
    }
    async getLogicId() {
        if (this.logicId == null) {
            js_moi_utils_1.ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
        }
        return this.logicId;
    }
    isEphemeral() {
        return this.state.has(js_moi_utils_1.LogicState.Ephemeral);
    }
    isPersistent() {
        return this.state.has(js_moi_utils_1.LogicState.Persistent);
    }
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