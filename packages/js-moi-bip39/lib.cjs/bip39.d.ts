/**
 * Synchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Uint8Array} The generated seed.
 *
 * @example
 * import { mnemonicToSeedSync } from "js-moi-sdk";
 *
 * const mnemonic = "abandon hair ...";
 * const seed = mnemonicToSeedSync(mnemonic);
 *
 * console.log(seed);
 *
 * >> Uint8Array(64) [ 0, 1, 2, ... ]
 */
export declare const mnemonicToSeedSync: (mnemonic: string, password?: string) => Uint8Array;
/**
 * Asynchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Promise<Uint8Array>} The generated seed.
 * @throws {Error} If an error occurs during the conversion.
 *
 * @example
 * import { mnemonicToSeed } from "js-moi-sdk";
 *
 * const mnemonic = "abandon hair ...";
 * const seed = await mnemonicToSeed(mnemonic);
 *
 * console.log(seed);
 *
 * >> Uint8Array(64) [ 0, 1, 2, ... ]
 */
export declare const mnemonicToSeed: (mnemonic: string, password?: string) => Promise<Uint8Array>;
/**
 * Convert a mnemonic to its corresponding entropy value.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding entropy.
 * @throws {Error} If the mnemonic is invalid or a wordlist is required but not found.
 *
 * @example
 * import { mnemonicToEntropy } from "js-moi-sdk";
 *
 * const mnemonic = "abandon hair ...";
 * const entropy = mnemonicToEntropy(mnemonic);
 *
 * console.log(entropy);
 *
 * >> "6ce1535a6fdd...ae6f27fa0835b7"
 */
export declare const mnemonicToEntropy: (mnemonic: string, wordlist?: string[]) => string;
/**
 * Convert entropy to its corresponding mnemonic.
 *
 * @param {Uint8Array|string} entropy - The entropy value.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding mnemonic phrase.
 * @throws {Error} If the entropy is invalid or a wordlist is required but not found.
 *
 * @example
 * import { entropyToMnemonic } from "js-moi-sdk";
 *
 * const entropy = "6ce1535a6fdd...ae6f27fa0835b7";
 * const mnemonic = entropyToMnemonic(entropy);
 *
 * console.log(mnemonic);
 *
 * >> "abandon hair ..."
 */
export declare const entropyToMnemonic: (entropy: Uint8Array | string, wordlist?: string[]) => string;
/**
 * Generate a mnemonic phrase with the specified strength (in bits).
 *
 * @param {number} strength - The strength of the mnemonic in bits.
 * @param {Function} rng - The random number generator function.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The generated mnemonic phrase.
 * @throws {TypeError} If the strength is not divisible by 32.
 *
 * @example
 * import { generateMnemonic } from "js-moi-sdk";
 *
 * const mnemonic = generateMnemonic();
 *
 * console.log(mnemonic);
 *
 * >> "abandon hair ..."
 */
export declare const generateMnemonic: (strength?: number, rng?: (size: number) => Uint8Array, wordlist?: string[]) => string;
/**
 * Validate a mnemonic phrase.
 *
 * @param {string} mnemonic - The mnemonic phrase to validate.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {boolean} True if the mnemonic is valid, false otherwise.
 *
 * @example
 * import { validateMnemonic } from "js-moi-sdk";
 *
 * const mnemonic = "abandon hair ...";
 * const isValid = validateMnemonic(mnemonic);
 *
 * console.log(isValid);
 *
 * >> true
 */
export declare const validateMnemonic: (mnemonic: string, wordlist?: string[]) => boolean;
/**
 * Get the currently set default wordlist.
 *
 * @returns {string} The language code of the default wordlist.
 * @throws {Error} If the default wordlist is not set.
 *
 * @example
 * import { getDefaultWordlist } from "js-moi-sdk";
 *
 * const wordlist = getDefaultWordlist();
 *
 * console.log(wordlist);
 *
 * >> "english"
 */
export declare const getDefaultWordlist: () => string;
//# sourceMappingURL=bip39.d.ts.map