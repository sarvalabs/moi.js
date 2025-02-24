import { IdentifierKind } from "./enums";
export class IdentifierTag {
    value;
    static MAX_IDENTIFIER_KIND = IdentifierKind.Logic;
    static kindMaxSupportedVersion = {
        [IdentifierKind.Participant]: 0,
        [IdentifierKind.Asset]: 0,
        [IdentifierKind.Logic]: 0,
    };
    constructor(value) {
        const validation = IdentifierTag.validate(value);
        if (validation) {
            throw new Error(`Invalid identifier value. ${validation.why}`);
        }
        this.value = value;
    }
    getKind() {
        return IdentifierTag.getKind(this.value);
    }
    getVersion() {
        return IdentifierTag.getVersion(this.value);
    }
    static getKind(value) {
        return value >> 4;
    }
    static getVersion(value) {
        return value & 0x0f;
    }
    static getMaxSupportedVersion(kind) {
        return IdentifierTag.kindMaxSupportedVersion[kind];
    }
    static getTag(kind, version) {
        return new IdentifierTag((kind << 4) | version);
    }
    static validate(value) {
        if (IdentifierTag.getKind(value) > this.MAX_IDENTIFIER_KIND) {
            return { why: "Unsupported identifier kind." };
        }
        if (IdentifierTag.getVersion(value) > IdentifierTag.getMaxSupportedVersion(IdentifierTag.getKind(value))) {
            return { why: "Unsupported identifier version." };
        }
        return null;
    }
}
//# sourceMappingURL=identifier-tag.js.map