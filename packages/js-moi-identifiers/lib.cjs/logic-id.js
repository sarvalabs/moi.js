"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLogicId = exports.logicId = exports.LogicId = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const base_identifier_1 = require("./base-identifier");
const enums_1 = require("./enums");
const flags_1 = require("./flags");
class LogicId extends base_identifier_1.BaseIdentifier {
    constructor(value) {
        super(value);
        const error = LogicId.validate(this.toBytes());
        if (error) {
            js_moi_utils_1.ErrorUtils.throwArgumentError(`Invalid logic identifier. ${error.why}`, "value", value);
        }
    }
    static validate(value) {
        const asset = value instanceof Uint8Array ? value : (0, js_moi_utils_1.hexToBytes)(value);
        const tag = this.getTag(asset);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a asset identifier." };
        }
        const hasUnsupportedFlags = (asset[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
}
exports.LogicId = LogicId;
/**
 * Generates a new LogicId identifier from the given value.
 *
 * @param value - The value to be used for generating the LogicId. It can be either a Uint8Array or a Hex string.
 * @returns An Identifier instance created from the provided value.
 */
const logicId = (value) => {
    return new LogicId(value);
};
exports.logicId = logicId;
/**
 * Checks if the given identifier is an instance of LogicId.
 *
 * @param value - The identifier to check.
 * @returns True if the identifier is an instance of LogicId, otherwise false.
 */
const isLogicId = (value) => {
    return value instanceof LogicId;
};
exports.isLogicId = isLogicId;
//# sourceMappingURL=logic-id.js.map