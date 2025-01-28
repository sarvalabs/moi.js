"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flagMasks = exports.getFlag = exports.setFlag = exports.Flag = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const enums_1 = require("./enums");
const identifier_tag_1 = require("./identifier-tag");
/**
 * Represents a flag specifier for an identifier.
 */
class Flag {
    index;
    support;
    constructor(kind, index, version) {
        if (index > 7) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid flag index. Expected a value between 0 and 7.", "index", index);
        }
        if (version > 15) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Invalid flag version. Expected a value between 0 and 15.", "version", version);
        }
        this.index = index;
        this.support = new Map([[kind, version]]);
    }
    /**
     * Checks if the given identifier tag is supported.
     *
     * @param tag - The identifier tag to check.
     * @returns `true` if the tag is supported, `false` otherwise.
     */
    supports(tag) {
        const version = this.support.get(tag.getKind());
        return version != null && tag.getVersion() >= version;
    }
}
exports.Flag = Flag;
/**
 * Sets or clears a specific bit in a number based on the provided flag.
 *
 * @param value - The original number whose bit is to be modified.
 * @param index - The position of the bit to be set or cleared (0-based).
 * @param flag - A boolean indicating whether to set (true) or clear (false) the bit.
 * @returns The modified number with the specified bit set or cleared.
 */
const setFlag = (value, index, flag) => {
    if (flag) {
        value |= 1 << index;
    }
    else {
        value = value & ~(1 << index);
    }
    return value;
};
exports.setFlag = setFlag;
/**
 * Determines if a specific flag is set in a given value.
 *
 * @param value - The number containing the flags.
 * @param index - The index of the flag to check (0-based).
 * @returns `true` if the flag at the specified index is set, otherwise `false`.
 */
const getFlag = (value, index) => {
    return (value & (1 << index)) !== 0;
};
exports.getFlag = getFlag;
exports.flagMasks = new Map([
    [identifier_tag_1.IdentifierTag.getTag(enums_1.IdentifierKind.Participant, enums_1.IdentifierVersion.V0).value, 0b01111111],
    [identifier_tag_1.IdentifierTag.getTag(enums_1.IdentifierKind.Logic, enums_1.IdentifierVersion.V0).value, 0b01111000],
    [identifier_tag_1.IdentifierTag.getTag(enums_1.IdentifierKind.Asset, enums_1.IdentifierVersion.V0).value, 0b01111111],
]);
//# sourceMappingURL=flags.js.map