import { AssetKind, IxType } from "moi-utils";
import Signature from "../src/signature";
import ECDSA_S256 from "../src/ecdsa";

export interface SigType {
    prefix: number;
    sigName: String;
    sign(message: Buffer, signingKey: string | Buffer): Signature
    verify(message: Buffer, signature: Signature, publicKey: Buffer): Boolean
}

export interface SigningAlgorithms {
    ecdsa_secp256k1: ECDSA_S256
}

export interface AssetCreatePayload {
    type: AssetKind;
    symbol: string;
    supply: number | bigint;
    standard?: number;
    dimension?: number;
    is_stateful?: boolean;
    is_logical?: boolean;
    logic_payload?: LogicPayload;
}

export interface AssetMintOrBurnPayload {
    asset_id: string;
    amount: number | bigint;
}

export interface LogicPayload {
    logic_id?: string;
    callsite: string;
    calldata: string;
    manifest?: string;
}

export interface InteractionObject {
    type: IxType;
    // Todo check if this mandatory or optional
    nonce?: number | bigint;

    sender: string;
    receiver?: string;
    payer?: string;

    transfer_values?: Record<string, number | bigint>;
    perceived_values?: Record<string, number | bigint>;

    fuel_price: number | bigint;
    fuel_limit: number | bigint;
    
    payload?: AssetCreatePayload | AssetMintOrBurnPayload | LogicPayload;
}
