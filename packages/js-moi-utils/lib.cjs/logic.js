"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.topicHash = void 0;
const blake2b_1 = require("@noble/hashes/blake2b");
const js_polo_1 = require("js-polo");
const hex_1 = require("./hex");
/**
 * Hashes a topic string
 *
 * @param {string} topic - topic value to hash
 * @returns {string} a hash of the topic
 */
const topicHash = (topic) => {
    const polorizer = new js_polo_1.Polorizer();
    polorizer.polorizeString(topic);
    return (0, hex_1.bytesToHex)((0, blake2b_1.blake2b)(polorizer.bytes(), { dkLen: 32 }));
};
exports.topicHash = topicHash;
//# sourceMappingURL=logic.js.map