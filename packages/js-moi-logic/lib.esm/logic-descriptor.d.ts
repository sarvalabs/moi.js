import type { Identifier } from "js-moi-identifiers";
import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, LogicState, type Element, type Hex, type LogicManifest } from "js-moi-utils";
/**
 * The `LogicDescriptor` class represents a logic descriptor.
 *
 * It provides methods to get information about the logic and its elements.
 */
export declare class LogicDescriptor extends ElementDescriptor {
    protected logicId?: Identifier;
    private readonly manifest;
    private coder?;
    private state;
    constructor(manifest: LogicManifest, logicId?: Identifier);
    protected setLogicId(logicId: Identifier): void;
    /**
     * Retrieves the engine from the logic manifest.
     *
     * @returns The engine specified in the logic manifest.
     */
    getEngine(): LogicManifest["engine"];
    /**
     * Retrieves the syntax from the logic manifest.
     *
     * @returns The syntax specified in the logic manifest.
     */
    getSyntax(): LogicManifest["syntax"];
    /**
     * Retrieves the logic ID.
     *
     * @returns The logic ID.
     *
     * @throws Will throw an error if the logic ID is not found.
     */
    getLogicId(): Promise<Identifier>;
    /**
     * Checks if the logic is ephemeral.
     *
     * @returns `true` if the logic is ephemeral, `false` otherwise.
     */
    isEphemeral(): boolean;
    /**
     * Checks if the logic is persistent.
     *
     * @returns `true` if the logic is persistent, `false` otherwise.
     */
    isPersistent(): boolean;
    /**
     * Retrieves the instance manifest coder.
     *
     * @returns The manifest coder.
     */
    getManifestCoder(): ManifestCoder;
    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    getManifest(format: ManifestCoderFormat.YAML): string;
    /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    getManifest(format: ManifestCoderFormat.POLO): Hex; /**
     * Retrieves the logic manifest in the specified format.
     *
     * @param format - The format to retrieve the manifest in.
     * @returns The logic manifest in the specified format.
     */
    /**
     * Retrieves the logic state element.
     *
     * @param state - The logic state to retrieve the element for.
     * @returns The logic state element.
     *
     * @throws Will throw an error if the state is not found.
     */
    getStateElement(state: LogicState): Element<ElementType.State>;
}
//# sourceMappingURL=logic-descriptor.d.ts.map