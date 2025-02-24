import { Keystore } from "../types/keystore";
/**
 * Encrypts the input data using AES in CTR mode with XOR.
 *
 * @param key - The encryption key as a Uint8Array.
 * @param input - The input data to be encrypted as a Uint8Array.
 * @param iv - The initialization vector as a Uint8Array.
 * @returns The encrypted data as a Uint8Array.
 */
export declare const aesCTRWithXOR: (key: Uint8Array, input: Uint8Array, iv: Uint8Array) => Uint8Array;
export declare const getKDFKeyForKeystore: (keystore: Keystore, password: string) => Uint8Array;
export declare const encryptKeystoreData: (data: Uint8Array, password: string) => Keystore;
export declare const decryptKeystoreData: (keystore: Keystore, password: string) => Uint8Array;
//# sourceMappingURL=keystore.d.ts.map