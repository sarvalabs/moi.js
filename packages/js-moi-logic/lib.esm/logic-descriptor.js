import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, ErrorCode, ErrorUtils, LogicState } from "js-moi-utils";
import { stringify as toYaml } from "yaml";
export class LogicDescriptor extends ElementDescriptor {
    logicId;
    manifest;
    coder;
    state = new Map();
    constructor(manifest, logicId) {
        if (manifest == null) {
            ErrorUtils.throwArgumentError("Manifest is required.", "manifest", manifest);
        }
        super(manifest.elements);
        this.manifest = manifest;
        this.logicId = logicId;
        for (const element of this.manifest.elements) {
            if (element.kind === ElementType.State) {
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
            ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
        }
        return this.logicId;
    }
    isEphemeral() {
        return this.state.has(LogicState.Ephemeral);
    }
    isPersistent() {
        return this.state.has(LogicState.Persistent);
    }
    getManifestCoder() {
        if (this.coder == null) {
            this.coder = new ManifestCoder(this.manifest);
        }
        return this.coder;
    }
    getManifest(format) {
        switch (format) {
            case ManifestCoderFormat.JSON:
                return this.manifest;
            case ManifestCoderFormat.YAML:
                return toYaml(this.manifest);
            case ManifestCoderFormat.POLO:
                return ManifestCoder.encodeManifest(this.manifest);
            default:
                ErrorUtils.throwArgumentError(`Unsupported format: ${format}`, "format", format);
        }
    }
    getStateElement(state) {
        const ptr = this.state.get(state);
        if (ptr == null) {
            ErrorUtils.throwError(`State "${state}" not found in logic.`, ErrorCode.NOT_FOUND);
        }
        const element = this.getElement(ptr);
        if (element.kind !== ElementType.State) {
            ErrorUtils.throwError(`Element is not a state: ${state}`, ErrorCode.UNKNOWN_ERROR);
        }
        return element;
    }
}
//# sourceMappingURL=logic-descriptor.js.map