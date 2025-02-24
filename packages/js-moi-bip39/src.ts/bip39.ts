/**
 * This code is based on the bitcoinjs/bip39 by Wei Lu and Danieal Cousens
 * Modifications have been made to adapt it to the needs of js-moi-bip39
 * including enhancements for browser compatibility and TypeScript conversion.
 *
 * Original module available at: https://github.com/bitcoinjs/bip39
 * Modified version available at: https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-bip39
 *
 * Copyright (c) 2014, Wei Lu <luwei.here@gmail.com> and Daniel Cousens <email@dcousens.com>
 * Repository ISC license details can be found at https://github.com/bitcoinjs/bip39/blob/master/LICENSE
 *
 **/
import { pbkdf2, pbkdf2Async } from "@noble/hashes/pbkdf2";
import { sha256 } from "@noble/hashes/sha256";
import { sha512 } from "@noble/hashes/sha512";
import { bytesToHex, encodeText, ensureHexPrefix, hexToBytes, isHex, randomBytes, trimHexPrefix } from "js-moi-utils";
import { _default, wordlists } from "./_wordlists";

let DEFAULT_WORDLIST = _default;
const INVALID_MNEMONIC = "Invalid mnemonic";
const INVALID_ENTROPY = "Invalid entropy";
const INVALID_CHECKSUM = "Invalid mnemonic checksum";
const WORDLIST_REQUIRED = "A wordlist is required but a default could not be found.\n" + "Please pass a 2048 word array explicitly.";

/**
 * Normalizes a string by converting it to Unicode Normalization Form KD (NFKD).
 *
 * @param {string} str - The string to normalize.
 * @returns {string} The normalized string.
 */
const normalize = (str?: string): string => {
    return (str ?? "").normalize("NFKD");
};

/**
 * Left pad a string with a padString to a specific length.
 *
 * @param {string} str - The string to pad.
 * @param {string} padString - The string used for padding.
 * @param {number} length - The target length of the padded string.
 * @returns {string} The padded string.
 */
const lpad = (str: string, padString: string, length: number): string => {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
};

/**
 * Convert a binary string to a byte (number).
 *
 * @param {string} bin - The binary string to convert.
 * @returns {number} The converted byte.
 */
const binaryToByte = (bin: string): number => {
    return parseInt(bin, 2);
};

/**
 * Convert an array of bytes to a binary string.
 *
 * @param {number[]} bytes - The array of bytes to convert.
 * @returns {string} The converted binary string.
 */
const bytesToBinary = (bytes: number[]): string => {
    return bytes.map((x) => lpad(x.toString(2), "0", 8)).join("");
};

/**
 * Derive the checksum bits from an entropy.
 *
 * @param {Uint8Array} entropyBuffer - The entropy bytes.
 * @returns {string} The derived checksum bits.
 */
const deriveChecksumBits = (entropyBuffer: Uint8Array): string => {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = sha256(Uint8Array.from(entropyBuffer));
    return bytesToBinary(Array.from(hash)).slice(0, CS);
};

/**
 * Generate a salt for PBKDF2 using a password.
 *
 * @param {string} password - The password.
 * @returns {string} The generated salt.
 */
const salt = (password: string): string => {
    return "mnemonic" + (password || "");
};

/**
 * Synchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Uint8Array} The generated seed.
 */
export const mnemonicToSeedSync = (mnemonic: string, password?: string): Uint8Array => {
    const res = pbkdf2(sha512, encodeText(normalize(mnemonic)), salt(normalize(password)), {
        c: 2048,
        dkLen: 64,
    });
    return res;
};

/**
 * Asynchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Promise<Uint8Array>} The generated seed.
 * @throws {Error} If an error occurs during the conversion.
 */
export const mnemonicToSeed = async (mnemonic: string, password?: string): Promise<Uint8Array> => {
    try {
        const res = await pbkdf2Async(sha512, encodeText(normalize(mnemonic)), salt(normalize(password)), {
            c: 2048,
            dkLen: 64,
        });

        return res;
    } catch (e) {
        throw new Error("Failed to generate seed from mnemonic", { cause: e });
    }
};

/**
 * Convert a mnemonic to its corresponding entropy value.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding entropy.
 * @throws {Error} If the mnemonic is invalid or a wordlist is required but not found.
 */
export const mnemonicToEntropy = (mnemonic: string, wordlist?: string[]): string => {
    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }

    const words = normalize(mnemonic).split(" ");
    if (words.length % 3 !== 0) {
        throw new Error(INVALID_MNEMONIC);
    }

    // convert word indices to 11 bit binary strings
    const bits = words
        .map((word) => {
            const index = wordlist!.indexOf(word);
            if (index === -1) {
                throw new Error(INVALID_MNEMONIC);
            }
            return lpad(index.toString(2), "0", 11);
        })
        .join("");

    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    const entropyBytes = entropyBits.match(/(.{1,8})/g)!.map(binaryToByte);
    if (entropyBytes.length < 16) {
        throw new Error(INVALID_ENTROPY);
    }
    if (entropyBytes.length > 32) {
        throw new Error(INVALID_ENTROPY);
    }
    if (entropyBytes.length % 4 !== 0) {
        throw new Error(INVALID_ENTROPY);
    }
    const entropy = Uint8Array.from(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits) {
        throw new Error(INVALID_CHECKSUM);
    }

    return trimHexPrefix(bytesToHex(entropy));
};

/**
 * Convert entropy to its corresponding mnemonic.
 *
 * @param {Uint8Array|string} entropy - The entropy value.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding mnemonic phrase.
 * @throws {Error} If the entropy is invalid or a wordlist is required but not found.
 */
export const entropyToMnemonic = (entropy: Uint8Array | string, wordlist?: string[]): string => {
    if (typeof entropy === "string") {
        entropy = isHex(ensureHexPrefix(entropy)) ? hexToBytes(entropy) : new Uint8Array([]);
    }

    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }

    if (entropy.length % 4 !== 0 || entropy.length < 16 || entropy.length > 32) {
        throw new TypeError(INVALID_ENTROPY);
    }

    const entropyBits = bytesToBinary(Array.from(entropy));
    const checksumBits = deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g)!;
    const words = chunks.map((binary) => {
        const index = binaryToByte(binary);
        return wordlist![index];
    });

    return wordlist![0] === "\u3042\u3044\u3053\u304f\u3057\u3093" // Japanese wordlist
        ? words.join("\u3000")
        : words.join(" ");
};

/**
 * Generate a mnemonic phrase with the specified strength (in bits).
 *
 * @param {number} strength - The strength of the mnemonic in bits.
 * @param {Function} rng - The random number generator function.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The generated mnemonic phrase.
 * @throws {TypeError} If the strength is not divisible by 32.
 */
export const generateMnemonic = (strength?: number, rng?: (size: number) => Uint8Array, wordlist?: string[]): string => {
    strength = strength || 128;
    if (strength % 32 !== 0) {
        throw new TypeError(INVALID_ENTROPY);
    }
    rng = rng ?? ((size) => randomBytes(size));
    return entropyToMnemonic(rng(strength / 8), wordlist);
};

/**
 * Validate a mnemonic phrase.
 *
 * @param {string} mnemonic - The mnemonic phrase to validate.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {boolean} True if the mnemonic is valid, false otherwise.
 */
export const validateMnemonic = (mnemonic: string, wordlist?: string[]): boolean => {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * Get the currently set default wordlist.
 *
 * @returns {string} The language code of the default wordlist.
 * @throws {Error} If the default wordlist is not set.
 */
export const getDefaultWordlist = (): string => {
    if (!DEFAULT_WORDLIST) {
        throw new Error("No Default Wordlist set");
    }

    return Object.keys(wordlists).filter((lang) => {
        if (lang === "JA" || lang === "EN") {
            return false;
        }
        return wordlists[lang].every((word, index) => word === DEFAULT_WORDLIST[index]);
    })[0];
};
