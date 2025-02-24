import { SigType } from "../types";
import Signature from "./signature";
/**
 * ECDSA_S256
 *
 * Represents the ECDSA_S256 signature type.
 */
export default class ECDSA_S256 implements SigType {
    readonly prefix: number;
    readonly sigName: string;
    /**
     * Signs a message using the provided signing key.
     *
     * @param message - The message to be signed as a Uint8Array.
     * @param signingKey - The signing key, which can be either a Uint8Array or a hexadecimal string.
     * @returns A Signature object containing the signed message.
     */
    sign(message: Uint8Array, signingKey: Uint8Array | string): Signature;
    /**
     * verify
     *
     * Verifies the ECDSA signature with the given secp256k1 publicKey
     *
     * @param message the message being signed
     * @param signature the Signature instance with parity byte
     * as extra data to determine the public key's X & Y co-ordinates
     * having same or different sign
     * @param publicKey the compressed public key
     * @returns boolean, to determine whether verification is success/failure
     */
    verify(message: Uint8Array, signature: Signature, publicKey: Uint8Array): boolean;
}
//# sourceMappingURL=ecdsa.d.ts.map