import { blake2b } from "@noble/hashes/blake2b";
import { Polorizer } from "js-polo";
import { bytesToHex } from "./hex";
/**
 * Hashes a topic string
 *
 * @param {string} topic - topic value to hash
 * @returns {string} a hash of the topic
 */
export const topicHash = (topic) => {
    const polorizer = new Polorizer();
    polorizer.polorizeString(topic);
    return bytesToHex(blake2b(polorizer.bytes(), { dkLen: 32 }));
};
//# sourceMappingURL=logic.js.map