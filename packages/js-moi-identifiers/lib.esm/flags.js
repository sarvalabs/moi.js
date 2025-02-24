import { IdentifierKind, IdentifierVersion } from "./enums";
import { IdentifierTag } from "./identifier-tag";
/**
 * Represents a flag specifier for an identifier.
 */
export class Flag {
    index;
    support;
    constructor(kind, index, version) {
        if (index > 7) {
            throw new RangeError("Invalid flag index. Expected a value between 0 and 7.");
        }
        if (version > 15) {
            throw new RangeError("Invalid flag version. Expected a value between 0 and 15.");
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
/**
 * Sets or clears a specific bit in a number based on the provided flag.
 *
 * @param value - The original number whose bit is to be modified.
 * @param index - The position of the bit to be set or cleared (0-based).
 * @param flag - A boolean indicating whether to set (true) or clear (false) the bit.
 * @returns The modified number with the specified bit set or cleared.
 */
export const setFlag = (value, index, flag) => {
    if (flag) {
        value |= 1 << index;
    }
    else {
        value = value & ~(1 << index);
    }
    return value;
};
/**
 * Determines if a specific flag is set in a given value.
 *
 * @param value - The number containing the flags.
 * @param index - The index of the flag to check (0-based).
 * @returns `true` if the flag at the specified index is set, otherwise `false`.
 */
export const getFlag = (value, index) => {
    return (value & (1 << index)) !== 0;
};
export const flagMasks = new Map([
    [IdentifierTag.getTag(IdentifierKind.Participant, IdentifierVersion.V0).value, 0b01111111],
    [IdentifierTag.getTag(IdentifierKind.Logic, IdentifierVersion.V0).value, 0b01111000],
    [IdentifierTag.getTag(IdentifierKind.Asset, IdentifierVersion.V0).value, 0b01111111],
]);
//# sourceMappingURL=flags.js.map