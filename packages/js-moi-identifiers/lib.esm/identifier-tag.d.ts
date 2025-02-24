import { IdentifierKind, type IdentifierVersion } from "./enums";
import type { InvalidReason } from "./identifier";
export declare class IdentifierTag {
    readonly value: number;
    private static MAX_IDENTIFIER_KIND;
    private static kindMaxSupportedVersion;
    constructor(value: number);
    getKind(): IdentifierKind;
    getVersion(): number;
    static getKind(value: number): IdentifierKind;
    static getVersion(value: number): number;
    static getMaxSupportedVersion(kind: IdentifierKind): number;
    static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag;
    static validate(value: number): InvalidReason | null;
}
//# sourceMappingURL=identifier-tag.d.ts.map