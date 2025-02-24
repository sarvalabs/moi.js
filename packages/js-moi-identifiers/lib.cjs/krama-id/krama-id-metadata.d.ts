import { NetworkZone } from "./krama-id-enums";
/**
 * KramaIdMetadata provides a way to extract the network zone of a Krama ID.
 */
export declare class KramaIdMetadata {
    readonly value: number;
    constructor(value: number);
    /**
     * Retrieves the network zone of the Krama ID.
     *
     * @returns {NetworkZone} The network zone of the Krama ID, derived by shifting the value 4 bits to the right.
     */
    getZone(): NetworkZone;
}
//# sourceMappingURL=krama-id-metadata.d.ts.map