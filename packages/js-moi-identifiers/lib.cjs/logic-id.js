"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicId = void 0;
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const utils_1 = require("./utils");
class LogicId extends identifier_1.Identifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid logic identifier. ${error.why}`);
        }
    }
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
    static isValid(value) {
        return this.validate(value) === null;
    }
}
exports.LogicId = LogicId;
//# sourceMappingURL=logic-id.js.map