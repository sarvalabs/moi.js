/**
 * Synchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Uint8Array} The generated seed.
 */
export declare const mnemonicToSeedSync: (mnemonic: string, password?: string) => Uint8Array;
/**
 * Asynchronously convert a mnemonic to a seed.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string} [password] - The optional password.
 * @returns {Promise<Uint8Array>} The generated seed.
 * @throws {Error} If an error occurs during the conversion.
 */
export declare const mnemonicToSeed: (mnemonic: string, password?: string) => Promise<Uint8Array>;
/**
 * Convert a mnemonic to its corresponding entropy value.
 *
 * @param {string} mnemonic - The mnemonic phrase.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding entropy.
 * @throws {Error} If the mnemonic is invalid or a wordlist is required but not found.
 */
export declare const mnemonicToEntropy: (mnemonic: string, wordlist?: string[]) => string;
/**
 * Convert entropy to its corresponding mnemonic.
 *
 * @param {Uint8Array|string} entropy - The entropy value.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {string} The corresponding mnemonic phrase.
 * @throws {Error} If the entropy is invalid or a wordlist is required but not found.
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
 */
export declare const generateMnemonic: (strength?: number, rng?: (size: number) => Uint8Array, wordlist?: string[]) => string;
/**
 * Validate a mnemonic phrase.
 *
 * @param {string} mnemonic - The mnemonic phrase to validate.
 * @param {string[]} [wordlist] - The optional wordlist.
 * @returns {boolean} True if the mnemonic is valid, false otherwise.
 */
export declare const validateMnemonic: (mnemonic: string, wordlist?: string[]) => boolean;
/**
 * Get the currently set default wordlist.
 *
 * @returns {string} The language code of the default wordlist.
 * @throws {Error} If the default wordlist is not set.
 */
export declare const getDefaultWordlist: () => string;
//# sourceMappingURL=bip39.d.ts.map