import { IdentifierKind } from "./enums";
import { flagMasks } from "./flags";
import { Identifier, type InvalidReason } from "./identifier";
import { hexToBytes, type Hex } from "./utils";

export class LogicId extends Identifier {
    constructor(value: Uint8Array | Hex | LogicId) {
        super(value);

        const error = LogicId.validate(this.toBytes());

        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }

    public static validate(value: Uint8Array | Hex): InvalidReason | null {
        const logic = value instanceof Uint8Array ? value : hexToBytes(value);

        if (logic.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }

        const tag = this.getTag(logic);
        const kind = tag.getKind();

        if (kind !== IdentifierKind.Logic) {
            return { why: "Invalid identifier kind. Expected a logic identifier." };
        }

        const hasUnsupportedFlags = (logic[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;

        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }

        return null;
    }

    public static isValid(value: Uint8Array | Hex): boolean {
        return this.validate(value) === null;
    }
}
