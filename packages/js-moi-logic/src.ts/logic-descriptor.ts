import type { Identifier } from "js-moi-identifiers";
import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, ErrorCode, ErrorUtils, LogicState, type Element, type Hex, type LogicManifest } from "js-moi-utils";
import { stringify as toYaml } from "yaml";

/**
 * The `LogicDescriptor` class represents a logic descriptor.
 *
 * It provides methods to get information about the logic and its elements.
 */
export class LogicDescriptor extends ElementDescriptor {
    protected logicId?: Identifier;

    private readonly manifest: LogicManifest;

    private coder?: ManifestCoder;

    private state: Map<LogicState, number> = new Map();

    constructor(manifest: LogicManifest, logicId?: Identifier) {
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

    protected setLogicId(logicId: Identifier) {
        this.logicId = logicId;
    }

    /**
     * Retrieves the engine from the logic manifest.
     *
     * @returns The engine specified in the logic manifest.
     */
    public getEngine(): LogicManifest["engine"] {
        return this.manifest.engine;
    }

    /**
     * Retrieves the syntax from the logic manifest.
     *
     * @returns The syntax specified in the logic manifest.
     */
    public getSyntax(): LogicManifest["syntax"] {
        return this.manifest.syntax;
    }

    /**
     * Retrieves the logic ID.
     *
     * @returns The logic ID.
     *
     * @throws Will throw an error if the logic ID is not found.
     */
    public async getLogicId(): Promise<Identifier> {
        if (this.logicId == null) {
            ErrorUtils.throwError("Logic id not found. This can happen if the logic is not deployed.", ErrorCode.NOT_INITIALIZED);
        }

        return this.logicId;
    }

    /**
     * Checks if the logic is ephemeral.
     *
     * @returns `true` if the logic is ephemeral, `false` otherwise.
     */
    public isEphemeral(): boolean {
        return this.state.has(LogicState.Ephemeral);
    }

    /**
     * Checks if the logic is persistent.
     *
     * @returns `true` if the logic is persistent, `false` otherwise.
     */
    public isPersistent(): boolean {
        return this.state.has(LogicState.Persistent);
    }

    /**
     * Retrieves the instance manifest coder.
     *
     * @returns The manifest coder.
     */
    public getManifestCoder(): ManifestCoder {
        if (this.coder == null) {
            this.coder = new ManifestCoder(this.manifest);
        }

        return this.coder;
    }

    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    public getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    public getManifest(format: ManifestCoderFormat.YAML): string;
    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    public getManifest(format: ManifestCoderFormat.POLO): Hex; /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    public getManifest(format: ManifestCoderFormat) {
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

    /**
     * Retrieves the logic state element.
     *
     * @param state - The logic state to retrieve the element for.
     * @returns The logic state element.
     *
     * @throws Will throw an error if the state is not found.
     */
    public getStateElement(state: LogicState): Element<ElementType.State> {
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
