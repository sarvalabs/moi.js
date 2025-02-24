"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMnemonic = exports.mnemonicToSeedSync = exports.mnemonicToSeed = exports.mnemonicToEntropy = exports.getDefaultWordlist = exports.generateMnemonic = exports.entropyToMnemonic = exports.wordlists = exports._default = void 0;
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
var _wordlists_1 = require("./_wordlists");
Object.defineProperty(exports, "_default", { enumerable: true, get: function () { return _wordlists_1._default; } });
Object.defineProperty(exports, "wordlists", { enumerable: true, get: function () { return _wordlists_1.wordlists; } });
var bip39_1 = require("./bip39");
Object.defineProperty(exports, "entropyToMnemonic", { enumerable: true, get: function () { return bip39_1.entropyToMnemonic; } });
Object.defineProperty(exports, "generateMnemonic", { enumerable: true, get: function () { return bip39_1.generateMnemonic; } });
Object.defineProperty(exports, "getDefaultWordlist", { enumerable: true, get: function () { return bip39_1.getDefaultWordlist; } });
Object.defineProperty(exports, "mnemonicToEntropy", { enumerable: true, get: function () { return bip39_1.mnemonicToEntropy; } });
Object.defineProperty(exports, "mnemonicToSeed", { enumerable: true, get: function () { return bip39_1.mnemonicToSeed; } });
Object.defineProperty(exports, "mnemonicToSeedSync", { enumerable: true, get: function () { return bip39_1.mnemonicToSeedSync; } });
Object.defineProperty(exports, "validateMnemonic", { enumerable: true, get: function () { return bip39_1.validateMnemonic; } });
//# sourceMappingURL=index.js.map