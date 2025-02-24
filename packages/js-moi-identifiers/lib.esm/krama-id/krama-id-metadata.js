import { NetworkZone } from "./krama-id-enums";
/**
 * KramaIdMetadata provides a way to extract the network zone of a Krama ID.
 */
export class KramaIdMetadata {
    value;
    constructor(value) {
        this.value = value;
        if (this.getZone() > NetworkZone.Zone3) {
            throw new Error("Invalid network zone");
        }
    }
    /**
     * Retrieves the network zone of the Krama ID.
     *
     * @returns {NetworkZone} The network zone of the Krama ID, derived by shifting the value 4 bits to the right.
     */
    getZone() {
        return this.value >> 4;
    }
}
//# sourceMappingURL=krama-id-metadata.js.map