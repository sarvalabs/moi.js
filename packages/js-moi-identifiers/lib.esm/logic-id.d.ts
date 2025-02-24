import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
/**
 * Represents a logic identifier which extends the base `Identifier` class.
 */
export declare class LogicId extends Identifier {
    constructor(value: Uint8Array | Hex | LogicId);
    /**
     * Validates a given identifier value.
     *
     * @param value - The identifier value to validate. It can be either a Uint8Array or a Hex string.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or null if the identifier is valid.
     */
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    /**
     * Checks if the provided value is valid.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns A boolean indicating whether the value is valid (true) or not (false).
     */
    static isValid(value: Uint8Array | Hex): boolean;
}
//# sourceMappingURL=logic-id.d.ts.map