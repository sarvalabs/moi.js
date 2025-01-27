import { bytesToHex, concatBytes, ErrorUtils, hexToBytes, isHex, isNullBytes, type Hex } from "js-moi-utils";
import { flagMasks, getFlag, setFlag, type Flag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierKind } from "./identifier-kind";
import { IdentifierTag, TagParticipantV0 } from "./identifier-tag";

export class ParticipantId {
    private readonly bytes: Uint8Array;

    constructor(value: Uint8Array) {
        if (value.length !== 32) {
            ErrorUtils.throwArgumentError("Invalid byte length for participant identifier. Expected 32 bytes.", "value", value);
        }

        this.bytes = value;

        const error = ParticipantId.validate(this);

        if (error) {
            ErrorUtils.throwArgumentError(`Invalid participant identifier. ${error.message}`, "value", value);
        }
    }

    public getTag(): IdentifierTag {
        return new IdentifierTag(this.bytes[0]);
    }

    public static validate(participant: ParticipantId): Error | null {
        const tag = participant.getTag();
        const error = IdentifierTag.validate(tag);

        if (error) {
            return error;
        }

        if (tag.getKind() !== IdentifierKind.Participant) {
            return new Error("Invalid identifier kind. Expected a participant identifier.");
        }

        if ((participant[1] & (flagMasks.get(tag.getValue()) ?? 0)) !== 0) {
            return new Error("Invalid participant identifier flags.");
        }

        return null;
    }

    public static fromHex(value: Hex): ParticipantId {
        if (!isHex(value)) {
            ErrorUtils.throwArgumentError("Invalid hex value.", "value", value);
        }

        return new ParticipantId(hexToBytes(value));
    }

    toBytes(): Uint8Array {
        return new Uint8Array(this.bytes);
    }

    toHex(): Hex {
        return bytesToHex(this.bytes);
    }

    toIdentifier(): Identifier {
        return new Identifier(this.bytes);
    }

    public getFingerprint() {
        return new Uint8Array(this.bytes.slice(4, 28));
    }

    public getVariant() {
        const variant = new Uint8Array(this.bytes.slice(28));
        return new DataView(variant.buffer).getUint32(0, true);
    }

    public isVariant() {
        const variant = new Uint8Array(this.bytes.slice(28));
        return !isNullBytes(variant);
    }

    public isFlagSupported(flag: Flag): boolean {
        if (!flag.supports(this.getTag())) {
            return false;
        }

        return getFlag(this.bytes[1], flag.index);
    }

    public static generateParticipantIdV0(fingerprint: Uint8Array, variant: number, ...flags: Flag[]): ParticipantId {
        if (fingerprint.length !== 24) {
            ErrorUtils.throwArgumentError("Invalid fingerprint length. Expected 24 bytes.", "fingerprint", fingerprint);
        }

        const metadata = new Uint8Array(4);

        metadata[0] = TagParticipantV0.getValue();

        for (const flag of flags) {
            if (!flag.supports(TagParticipantV0)) {
                ErrorUtils.throwError("Unsupported flag for participant identifier.");
            }

            metadata[1] = setFlag(metadata[1], flag.index, true);
        }

        let buff = concatBytes(metadata, new Uint8Array(fingerprint), new Uint8Array(4));
        new DataView(buff.buffer).setUint32(28, variant, true);

        return new ParticipantId(buff);
    }
}
