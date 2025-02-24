import { IdentifierKind, IdentifierVersion } from "./enums";
import { flagMasks, setFlag } from "./flags";
import { Identifier } from "./identifier";
import { IdentifierTag } from "./identifier-tag";
import { hexToBytes } from "./utils";
/**
 * Represents a participant identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 * for participant identifiers.
 *
 * @param value - The identifier value as a `Uint8Array`, `Hex`, or `Identifier`.
 */
export class ParticipantId extends Identifier {
    constructor(value) {
        super(value);
        const error = ParticipantId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid participant identifier. ${error.why}`);
        }
    }
    /**
     * Validates a participant identifier.
     *
     * @param value - The identifier to validate, which can be a Uint8Array or a hexadecimal string.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or null if the identifier is valid.
     */
    static validate(value) {
        const participant = value instanceof Uint8Array ? value : hexToBytes(value);
        if (participant.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
        const tag = this.getTag(participant);
        const kind = tag.getKind();
        if (kind !== IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a participant identifier." };
        }
        const hasUnsupportedFlags = (participant[1] & (flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    /**
     * Checks if the given value is a valid participant identifier.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns `true` if the value is valid, otherwise `false`.
     */
    static isValid(value) {
        return this.validate(value) === null;
    }
}
/**
 * Generates a participant identifier based on the provided options.
 *
 * @returns A new `ParticipantId` instance.
 *
 * @throws {Error} If the identifier version is not `IdentifierVersion.V0`.
 * @throws {Error} If the fingerprint length is not 24 bytes.
 * @throws {Error} If any flag is unsupported for the participant identifier.
 *
 * @example
 * import { createParticipantId, IdentifierVersion, randomBytes } from "js-moi-sdk";
 *
 * const participant = createParticipantId({
 * fingerprint: randomBytes(24),
 *     variant: 0,
 *     version: IdentifierVersion.V0,
 * });
 *
 * console.log(participant.toString());
 *
 * >> "0x00000000168f031d5aaffe36b54dc4df07a5921ade2c1ac51b6df83800000000"
 */
export const createParticipantId = (option) => {
    if (option.version !== IdentifierVersion.V0) {
        throw new TypeError("Invalid identifier version. Expected V0.");
    }
    if (option.fingerprint.length !== 24) {
        throw new TypeError("Invalid fingerprint length. Expected 24 bytes.");
    }
    const metadata = new Uint8Array(4);
    const participantTag = IdentifierTag.getTag(IdentifierKind.Participant, option.version);
    metadata[0] = participantTag.value;
    for (const flag of option.flags ?? []) {
        if (!flag.supports(participantTag)) {
            throw new Error(`Invalid flag. Unsupported flag for participant identifier.`);
        }
        metadata[1] = setFlag(metadata[1], flag.index, true);
    }
    const participant = Uint8Array.from([...metadata, ...option.fingerprint, ...new Uint8Array(4)]);
    new DataView(participant.buffer).setUint32(28, option.variant, false);
    return new ParticipantId(participant);
};
//# sourceMappingURL=participant-id.js.map