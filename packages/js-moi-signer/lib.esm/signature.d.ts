import { ISignature } from "../types";
export default class Signature implements ISignature {
    private prefix?;
    private _digest?;
    private extraData?;
    private name?;
    constructor(prefix?: Uint8Array, digest?: Uint8Array, extraData?: Uint8Array, signatureName?: string);
    unmarshall(signature: Uint8Array | String): void;
    digest(): Uint8Array;
    /**
     * getSigByte
     *
     * Retrieves the signature byte of the signature prefix.
     *
     * @returns The signature byte as a number.
     * @throws Error if the signature byte is invalid.
     */
    getSigByte(): number;
    /**
     * getName
     *
     * Retrieves the name of the signature algorithm.
     *
     * @returns The name of the signature algorithm as a string.
     */
    getName(): string;
    extra(): Uint8Array;
    serialize(): Uint8Array;
    /**
     * getSignatureName
     *
     * Retrieves the name of the signature algorithm based on the given signature index.
     *
     * @param sigIndex - The signature index used to determine the signature algorithm name.
     * @returns The name of the signature algorithm as a string.
     */
    private getSignatureName;
}
//# sourceMappingURL=signature.d.ts.map