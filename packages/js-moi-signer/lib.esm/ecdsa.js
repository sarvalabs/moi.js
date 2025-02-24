import { blake2b } from "@noble/hashes/blake2b";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha256";
import * as nobleECC from "@noble/secp256k1";
import { hexToBytes } from "js-moi-utils";
import Signature from "./signature";
import { JoinSignature, bip66Decode, bip66Encode, fromDER, toDER } from "./utils";
/**
 * Setting the `hmacSha256Sync` with custom hashing logic
 * @param key
 * @param msgs
 */
nobleECC.utils.hmacSha256Sync = (key, ...msgs) => hmac(sha256, key, nobleECC.utils.concatBytes(...msgs));
/**
 * ECDSA_S256
 *
 * Represents the ECDSA_S256 signature type.
 */
export default class ECDSA_S256 {
    prefix = 1;
    sigName = "ECDSA_S256";
    /**
     * Signs a message using the provided signing key.
     *
     * @param message - The message to be signed as a Uint8Array.
     * @param signingKey - The signing key, which can be either a Uint8Array or a hexadecimal string.
     * @returns A Signature object containing the signed message.
     */
    sign(message, signingKey) {
        let _signingKey;
        if (typeof signingKey === "string") {
            _signingKey = hexToBytes(signingKey);
        }
        else {
            _signingKey = signingKey;
        }
        const messageHash = blake2b(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });
        const sigParts = nobleECC.signSync(messageHash, _signingKey, { der: false });
        const digest = {
            _r: toDER(sigParts.slice(0, 32)),
            _s: toDER(sigParts.slice(32, 64)),
        };
        const signature = bip66Encode(digest);
        const prefixArray = new Uint8Array(2);
        prefixArray[0] = this.prefix;
        prefixArray[1] = signature.length;
        const pubKey = nobleECC.getPublicKey(_signingKey, true);
        const parityByte = new Uint8Array([pubKey[0]]);
        const sig = new Signature(prefixArray, signature, parityByte, this.sigName);
        return sig;
    }
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
    verify(message, signature, publicKey) {
        let verificationKey = new Uint8Array(signature.extra().length + publicKey.length);
        verificationKey.set(signature.extra());
        verificationKey.set(publicKey, signature.extra().length);
        let derSignature = signature.digest();
        const messageHash = blake2b(message, {
            dkLen: 1 << 5, // Hashing raw message with blake2b to get 32 bytes digest
        });
        const _digest = bip66Decode(derSignature);
        const sigDigest = {
            _r: fromDER(_digest._r),
            _s: fromDER(_digest._s),
        };
        return nobleECC.verify(JoinSignature(sigDigest), messageHash, verificationKey, { strict: true });
    }
}
//# sourceMappingURL=ecdsa.js.map