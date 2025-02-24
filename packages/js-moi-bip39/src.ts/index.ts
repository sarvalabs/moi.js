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
export { _default, wordlists } from "./_wordlists";
export { entropyToMnemonic, generateMnemonic, getDefaultWordlist, mnemonicToEntropy, mnemonicToSeed, mnemonicToSeedSync, validateMnemonic } from "./bip39";
