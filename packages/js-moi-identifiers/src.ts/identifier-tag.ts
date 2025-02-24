import { IdentifierKind, type IdentifierVersion } from "./enums";
import type { InvalidReason } from "./identifier";

export class IdentifierTag {
    public readonly value: number;

    private static MAX_IDENTIFIER_KIND = IdentifierKind.Logic;

    private static kindMaxSupportedVersion: Record<IdentifierKind, number> = {
        [IdentifierKind.Participant]: 0,
        [IdentifierKind.Asset]: 0,
        [IdentifierKind.Logic]: 0,
    };

    constructor(value: number) {
        const validation = IdentifierTag.validate(value);

        if (validation) {
            throw new Error(`Invalid identifier value. ${validation.why}`);
        }

        this.value = value;
    }

    public getKind(): IdentifierKind {
        return IdentifierTag.getKind(this.value);
    }

    public getVersion(): number {
        return IdentifierTag.getVersion(this.value);
    }

    public static getKind(value: number): IdentifierKind {
        return value >> 4;
    }

    public static getVersion(value: number): number {
        return value & 0x0f;
    }

    public static getMaxSupportedVersion(kind: IdentifierKind): number {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }

    public static getTag(kind: IdentifierKind, version: IdentifierVersion): IdentifierTag {
        return new IdentifierTag((kind << 4) | version);
    }

    public static validate(value: number): InvalidReason | null {
        if (IdentifierTag.getKind(value) > this.MAX_IDENTIFIER_KIND) {
            return { why: "Unsupported identifier kind." };
        }

        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }

        return null;
    }
}
