import { ErrorCode, ErrorUtils, hexToBytes } from "js-moi-utils";
export default class Signature {
    prefix;
    _digest;
    extraData;
    name;
    constructor(prefix, digest, extraData, signatureName) {
        this.prefix = prefix;
        this._digest = digest;
        this.extraData = extraData;
        this.name = signatureName;
    }
    unmarshall(signature) {
        let sig;
        if (typeof signature === "string") {
            sig = hexToBytes(signature);
        }
        else {
            sig = signature;
        }
        const sigLen = sig[1];
        this.prefix = sig.subarray(0, 2);
        this._digest = sig.subarray(2, 2 + sigLen);
        this.extraData = sig.subarray(2 + sigLen);
        this.name = this.getSignatureName(sig[0]);
    }
    digest() {
        return this._digest;
    }
    /**
     * getSigByte
     *
     * Retrieves the signature byte of the signature prefix.
     *
     * @returns The signature byte as a number.
     * @throws Error if the signature byte is invalid.
     */
    getSigByte() {
        if (typeof this.prefix?.[0] !== "number") {
            ErrorUtils.throwError("Invalid signature byte.", ErrorCode.INVALID_SIGNATURE);
        }
        return this.prefix[0];
    }
    /**
     * getName
     *
     * Retrieves the name of the signature algorithm.
     *
     * @returns The name of the signature algorithm as a string.
     */
    getName() {
        return this.name;
    }
    extra() {
        return this.extraData;
    }
    serialize() {
        if (this.name === "") {
            ErrorUtils.throwError("Signature is not initialized", ErrorCode.NOT_INITIALIZED);
        }
        const finalSigBytesWithoutExtra = new Uint8Array([...this.prefix, ...this._digest]);
        const finalSigBytes = new Uint8Array([...finalSigBytesWithoutExtra, ...this.extraData]);
        return finalSigBytes;
    }
    /**
     * getSignatureName
     *
     * Retrieves the name of the signature algorithm based on the given signature index.
     *
     * @param sigIndex - The signature index used to determine the signature algorithm name.
     * @returns The name of the signature algorithm as a string.
     */
    getSignatureName(sigIndex) {
        switch (sigIndex) {
            case 1:
                return "ECDSA_S256";
            default:
                return "";
        }
    }
}
//# sourceMappingURL=signature.js.map