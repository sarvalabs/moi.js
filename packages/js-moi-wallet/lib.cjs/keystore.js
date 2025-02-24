"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptKeystoreData = exports.encryptKeystoreData = exports.getKDFKeyForKeystore = exports.aesCTRWithXOR = void 0;
const scrypt_1 = require("@noble/hashes/scrypt");
const sha3_1 = require("@noble/hashes/sha3");
const utils_1 = require("@noble/hashes/utils");
const aes_js_1 = require("aes-js");
const js_moi_utils_1 = require("js-moi-utils");
/**
 * Encrypts the input data using AES in CTR mode with XOR.
 *
 * @param key - The encryption key as a Uint8Array.
 * @param input - The input data to be encrypted as a Uint8Array.
 * @param iv - The initialization vector as a Uint8Array.
 * @returns The encrypted data as a Uint8Array.
 */
const aesCTRWithXOR = (key, input, iv) => {
    return new aes_js_1.CTR(key, iv).encrypt(input);
};
exports.aesCTRWithXOR = aesCTRWithXOR;
const getKDFKeyForKeystore = (keystore, password) => {
    const pwBuf = new TextEncoder().encode(password);
    const salt = (0, js_moi_utils_1.hexToBytes)(keystore.kdfparams.salt);
    const dkLen = keystore.kdfparams.dklen;
    if (keystore.kdf === "scrypt") {
        const n = keystore.kdfparams.n;
        const r = keystore.kdfparams.r;
        const p = keystore.kdfparams.p;
        return (0, scrypt_1.scrypt)(pwBuf, salt, { N: n, r, p, dkLen });
    }
    js_moi_utils_1.ErrorUtils.throwError(`Unsupported KDF: ${keystore.kdf}`, js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
};
exports.getKDFKeyForKeystore = getKDFKeyForKeystore;
const encryptKeystoreData = (data, password) => {
    const salt = (0, js_moi_utils_1.randomBytes)(32);
    const derivedKey = (0, scrypt_1.scrypt)(password, salt, {
        N: 4096,
        r: 8,
        p: 1,
        dkLen: 32,
    });
    const encryptKey = derivedKey.slice(0, 16);
    const iv = (0, js_moi_utils_1.randomBytes)(16);
    const cipherText = (0, exports.aesCTRWithXOR)(encryptKey, data, iv);
    const mac = (0, sha3_1.keccak_256)((0, utils_1.concatBytes)(derivedKey.slice(16, 32), cipherText));
    return {
        cipher: "aes-128-ctr",
        ciphertext: (0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(cipherText)),
        cipherparams: {
            IV: (0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(iv)),
        },
        kdf: "scrypt",
        kdfparams: {
            n: 4096,
            r: 8,
            p: 1,
            dklen: 32,
            salt: (0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(salt)),
        },
        mac: (0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(mac)),
    };
};
exports.encryptKeystoreData = encryptKeystoreData;
const decryptKeystoreData = (keystore, password) => {
    if (keystore.cipher !== "aes-128-ctr") {
        js_moi_utils_1.ErrorUtils.throwError(`Cipher not supported: ${keystore.cipher}`, js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION);
    }
    const iv = (0, js_moi_utils_1.hexToBytes)(keystore.cipherparams.IV);
    const cipherText = (0, js_moi_utils_1.hexToBytes)(keystore.ciphertext);
    const derivedKey = (0, exports.getKDFKeyForKeystore)(keystore, password);
    const hash = (0, sha3_1.keccak_256)((0, utils_1.concatBytes)(derivedKey.slice(16, 32), cipherText));
    if ((0, js_moi_utils_1.trimHexPrefix)((0, js_moi_utils_1.bytesToHex)(hash)) !== keystore.mac) {
        js_moi_utils_1.ErrorUtils.throwError("Could not decrypt key with the given password", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT);
    }
    return (0, exports.aesCTRWithXOR)(derivedKey.slice(0, 16), cipherText, iv);
};
exports.decryptKeystoreData = decryptKeystoreData;
//# sourceMappingURL=keystore.js.map