import type { Identifier } from "js-moi-identifiers";
import { ElementDescriptor, ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, LogicState, type Element, type Hex, type LogicManifest } from "js-moi-utils";
export declare class LogicDescriptor extends ElementDescriptor {
    protected logicId?: Identifier;
    private readonly manifest;
    private coder?;
    private state;
    constructor(manifest: LogicManifest, logicId?: Identifier);
    protected setLogicId(logicId: Identifier): void;
    getEngine(): LogicManifest["engine"];
    getSyntax(): LogicManifest["syntax"];
    getLogicId(): Promise<Identifier>;
    isEphemeral(): boolean;
    isPersistent(): boolean;
    getManifestCoder(): ManifestCoder;
    getManifest(format: ManifestCoderFormat.JSON): LogicManifest;
    getManifest(format: ManifestCoderFormat.YAML): string;
    getManifest(format: ManifestCoderFormat.POLO): Hex;
    getStateElement(state: LogicState): Element<ElementType.State>;
}
//# sourceMappingURL=logic-descriptor.d.ts.map