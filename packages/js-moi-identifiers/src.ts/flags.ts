import { ErrorUtils } from "js-moi-utils";

import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag, IdentifierVersion } from "./types/identifier";

/**
 * Represents a flag specifier for an identifier.
 */
export class Flag {
    public readonly index: number;

    private support: Map<IdentifierKind, number>;

    constructor(kind: IdentifierKind, index: number, version: number) {
        if (index > 7) {
            ErrorUtils.throwArgumentError("Invalid flag index. Expected a value between 0 and 7.", "index", index);
        }

        if (version > 15) {
            ErrorUtils.throwArgumentError("Invalid flag version. Expected a value between 0 and 15.", "version", version);
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
    supports(tag: IdentifierTag) {
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
export const setFlag = (value: number, index: number, flag: boolean): number => {
    if (flag) {
        value |= 1 << index;
    } else {
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
export const getFlag = (value: number, index: number): boolean => {
    return (value & (1 << index)) !== 0;
};

export const flagMasks = new Map<number, number>([
    [IdentifierTag.getTag(IdentifierKind.Participant, IdentifierVersion.V0).value, 0b01111111],
    [IdentifierTag.getTag(IdentifierKind.Logic, IdentifierVersion.V0).value, 0b01111000],
    [IdentifierTag.getTag(IdentifierKind.Asset, IdentifierVersion.V0).value, 0b01111111],
]);
