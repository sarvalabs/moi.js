import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
export declare class LogicId extends Identifier {
    constructor(value: Uint8Array | Hex | LogicId);
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    static isValid(value: Uint8Array | Hex): boolean;
}
//# sourceMappingURL=logic-id.d.ts.map