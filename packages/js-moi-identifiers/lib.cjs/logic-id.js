"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicId = void 0;
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const utils_1 = require("./utils");
/**
 * Represents a logic identifier which extends the base `Identifier` class.
 */
class LogicId extends identifier_1.Identifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }
    /**
     * Validates a given identifier value.
     *
     * @param value - The identifier value to validate. It can be either a Uint8Array or a Hex string.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or null if the identifier is valid.
     */
    static validate(value) {
        const logic = value instanceof Uint8Array ? value : (0, utils_1.hexToBytes)(value);
        if (logic.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
        const tag = this.getTag(logic);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Logic) {
            return { why: "Invalid identifier kind. Expected a logic identifier." };
        }
        const hasUnsupportedFlags = (logic[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    /**
     * Checks if the provided value is valid.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns A boolean indicating whether the value is valid (true) or not (false).
     */
    static isValid(value) {
        return this.validate(value) === null;
    }
}
exports.LogicId = LogicId;
//# sourceMappingURL=logic-id.js.map