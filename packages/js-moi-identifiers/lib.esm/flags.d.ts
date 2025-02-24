import { IdentifierKind } from "./enums";
import { IdentifierTag } from "./identifier-tag";
/**
 * Represents a flag specifier for an identifier.
 */
export declare class Flag {
    readonly index: number;
    private support;
    constructor(kind: IdentifierKind, index: number, version: number);
    /**
     * Checks if the given identifier tag is supported.
     *
     * @param tag - The identifier tag to check.
     * @returns `true` if the tag is supported, `false` otherwise.
     */
    supports(tag: IdentifierTag): boolean;
}
/**
 * Sets or clears a specific bit in a number based on the provided flag.
 *
 * @param value - The original number whose bit is to be modified.
 * @param index - The position of the bit to be set or cleared (0-based).
 * @param flag - A boolean indicating whether to set (true) or clear (false) the bit.
 * @returns The modified number with the specified bit set or cleared.
 */
export declare const setFlag: (value: number, index: number, flag: boolean) => number;
/**
 * Determines if a specific flag is set in a given value.
 *
 * @param value - The number containing the flags.
 * @param index - The index of the flag to check (0-based).
 * @returns `true` if the flag at the specified index is set, otherwise `false`.
 */
export declare const getFlag: (value: number, index: number) => boolean;
export declare const flagMasks: Map<number, number>;
//# sourceMappingURL=flags.d.ts.map