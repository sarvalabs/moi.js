import { Buffer } from "buffer";

export interface ISignature {
    Digest(): Uint8Array;
    
    Extra(): Uint8Array;

    getName(): string;

    getSigByte(): number

    serialize(): Uint8Array;

    unmarshall(signature: Uint8Array | String): void
}

export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, signingKey: string | Buffer): ISignature
    verify(message: Uint8Array, signature: ISignature, publicKey: Uint8Array): boolean
}

export interface ECDSA_S256 extends SigType {}

export interface SigningAlgorithms {
    ecdsa_secp256k1: ECDSA_S256
}
