export interface ISignature {
    digest(): Uint8Array;

    extra(): Uint8Array;

    getName(): string;

    getSigByte(): number;

    serialize(): Uint8Array;

    unmarshall(signature: Uint8Array | String): void;
}

export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Uint8Array, signingKey: string | Uint8Array): ISignature;
    verify(message: Uint8Array, signature: ISignature, publicKey: Uint8Array): boolean;
}

export interface ECDSA_S256 extends SigType {}

export interface SigningAlgorithms {
    ecdsa_secp256k1: ECDSA_S256;
}
