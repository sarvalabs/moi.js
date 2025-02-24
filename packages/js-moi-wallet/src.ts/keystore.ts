import { scrypt } from "@noble/hashes/scrypt";
import { keccak_256 } from "@noble/hashes/sha3";
import { concatBytes } from "@noble/hashes/utils";
import { CTR } from "aes-js";
import { bytesToHex, ErrorCode, ErrorUtils, hexToBytes, randomBytes, trimHexPrefix } from "js-moi-utils";
import { Keystore } from "../types/keystore";

/**
 * Encrypts the input data using AES in CTR mode with XOR.
 *
 * @param key - The encryption key as a Uint8Array.
 * @param input - The input data to be encrypted as a Uint8Array.
 * @param iv - The initialization vector as a Uint8Array.
 * @returns The encrypted data as a Uint8Array.
 */
export const aesCTRWithXOR = (key: Uint8Array, input: Uint8Array, iv: Uint8Array): Uint8Array => {
    return new CTR(key, iv).encrypt(input);
};

export const getKDFKeyForKeystore = (keystore: Keystore, password: string): Uint8Array => {
    const pwBuf = new TextEncoder().encode(password);
    const salt = hexToBytes(keystore.kdfparams.salt);
    const dkLen = keystore.kdfparams.dklen;

    if (keystore.kdf === "scrypt") {
        const n = keystore.kdfparams.n;
        const r = keystore.kdfparams.r;
        const p = keystore.kdfparams.p;
        return scrypt(pwBuf, salt, { N: n, r, p, dkLen });
    }

    ErrorUtils.throwError(`Unsupported KDF: ${keystore.kdf}`, ErrorCode.INVALID_ARGUMENT);
};

export const encryptKeystoreData = (data: Uint8Array, password: string): Keystore => {
    const salt = randomBytes(32);

    const derivedKey = scrypt(password, salt, {
        N: 4096,
        r: 8,
        p: 1,
        dkLen: 32,
    });

    const encryptKey = derivedKey.slice(0, 16);
    const iv = randomBytes(16);
    const cipherText = aesCTRWithXOR(encryptKey, data, iv);
    const mac = keccak_256(concatBytes(derivedKey.slice(16, 32), cipherText));

    return {
        cipher: "aes-128-ctr",
        ciphertext: trimHexPrefix(bytesToHex(cipherText)),
        cipherparams: {
            IV: trimHexPrefix(bytesToHex(iv)),
        },
        kdf: "scrypt",
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: trimHexPrefix(bytesToHex(salt)),
        },
        mac: trimHexPrefix(bytesToHex(mac)),
    };
};

export const decryptKeystoreData = (keystore: Keystore, password: string): Uint8Array => {
    if (keystore.cipher !== "aes-128-ctr") {
        ErrorUtils.throwError(`Cipher not supported: ${keystore.cipher}`, ErrorCode.UNSUPPORTED_OPERATION);
    }

    const iv = hexToBytes(keystore.cipherparams.IV);
    const cipherText = hexToBytes(keystore.ciphertext);
    const derivedKey = getKDFKeyForKeystore(keystore, password);
    const hash = keccak_256(concatBytes(derivedKey.slice(16, 32), cipherText));

    if (trimHexPrefix(bytesToHex(hash)) !== keystore.mac) {
        ErrorUtils.throwError("Could not decrypt key with the given password", ErrorCode.INVALID_ARGUMENT);
    }

    return aesCTRWithXOR(derivedKey.slice(0, 16), cipherText, iv);
};
