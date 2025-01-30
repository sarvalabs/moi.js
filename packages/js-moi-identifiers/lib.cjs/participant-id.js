"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createParticipantId = exports.ParticipantId = void 0;
const enums_1 = require("./enums");
const flags_1 = require("./flags");
const identifier_1 = require("./identifier");
const identifier_tag_1 = require("./identifier-tag");
const utils_1 = require("./utils");
/**
 * Represents a participant identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 * for participant identifiers.
 *
 * @param value - The identifier value as a `Uint8Array`, `Hex`, or `Identifier`.
 */
class ParticipantId extends identifier_1.Identifier {
    constructor(value) {
        super(value);
        const error = ParticipantId.validate(this.toBytes());
        if (error) {
            throw new Error(`Invalid participant identifier. ${error.why}`);
        }
    }
    static validate(value) {
        const participant = value instanceof Uint8Array ? value : (0, utils_1.hexToBytes)(value);
        if (participant.length !== 32) {
            return { why: "Invalid length. Expected a 32-byte identifier." };
        }
        const tag = this.getTag(participant);
        const kind = tag.getKind();
        if (kind !== enums_1.IdentifierKind.Participant) {
            return { why: "Invalid identifier kind. Expected a participant identifier." };
        }
        const hasUnsupportedFlags = (participant[1] & (flags_1.flagMasks.get(tag.value) ?? 0)) !== 0;
        if (hasUnsupportedFlags) {
            return { why: "Invalid Flags. Unsupported flags for identifier" };
        }
        return null;
    }
    static isValid(value) {
        return this.validate(value) === null;
    }
}
exports.ParticipantId = ParticipantId;
/**
 * Generates a participant identifier based on the provided options.
 *
 * @returns A new `ParticipantId` instance.
 *
 * @throws {Error} If the identifier version is not `IdentifierVersion.V0`.
 * @throws {Error} If the fingerprint length is not 24 bytes.
 * @throws {Error} If any flag is unsupported for the participant identifier.
 */
const createParticipantId = (option) => {
    if (option.version !== enums_1.IdentifierVersion.V0) {
        throw new TypeError("Invalid identifier version. Expected V0.");
    }
    if (option.fingerprint.length !== 24) {
        throw new TypeError("Invalid fingerprint length. Expected 24 bytes.");
    }
    const metadata = new Uint8Array(4);
    const participantTag = identifier_tag_1.IdentifierTag.getTag(enums_1.IdentifierKind.Participant, option.version);
    metadata[0] = participantTag.value;
    for (const flag of option.flags ?? []) {
        if (!flag.supports(participantTag)) {
            throw new Error(`Invalid flag. Unsupported flag for participant identifier.`);
        }
        metadata[1] = (0, flags_1.setFlag)(metadata[1], flag.index, true);
    }
    const participant = Uint8Array.from([...metadata, ...option.fingerprint, ...new Uint8Array(4)]);
    new DataView(participant.buffer).setUint32(28, option.variant, false);
    return new ParticipantId(participant);
};
exports.createParticipantId = createParticipantId;
//# sourceMappingURL=participant-id.js.map