import { IdentifierVersion } from "./enums";
import { type Flag } from "./flags";
import { Identifier, type InvalidReason } from "./identifier";
import { type Hex } from "./utils";
export interface GenerateParticipantOption {
    version: IdentifierVersion;
    fingerprint: Uint8Array;
    variant: number;
    flags?: Flag[];
}
/**
 * Represents a participant identifier which extends the base `Identifier` class.
 * This class ensures that the provided identifier is valid according to specific rules
 * for participant identifiers.
 *
 * @param value - The identifier value as a `Uint8Array`, `Hex`, or `Identifier`.
 */
export declare class ParticipantId extends Identifier {
    constructor(value: Uint8Array | Hex | Identifier);
    /**
     * Validates a participant identifier.
     *
     * @param value - The identifier to validate, which can be a Uint8Array or a hexadecimal string.
     * @returns An object containing the reason for invalidity if the identifier is invalid, or null if the identifier is valid.
     */
    static validate(value: Uint8Array | Hex): InvalidReason | null;
    /**
     * Checks if the given value is a valid participant identifier.
     *
     * @param value - The value to be validated, which can be a Uint8Array or a Hex string.
     * @returns `true` if the value is valid, otherwise `false`.
     */
    static isValid(value: Uint8Array | Hex): boolean;
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
export declare const createParticipantId: (option: GenerateParticipantOption) => ParticipantId;
//# sourceMappingURL=participant-id.d.ts.map