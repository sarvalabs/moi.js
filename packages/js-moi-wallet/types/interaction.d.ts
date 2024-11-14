import { OpType } from "js-moi-utils";

interface ProcessedIxAssetFund {
    asset_id: string;
    amount: number;
}

interface ProcessedIxPreferences {
    compute: Uint8Array;
    consensus: Uint8Array;
}

interface ProcessedIxOperation {
    type: OpType
    payload: Uint8Array
}

interface ProcessedIxParticipant {
    address: Uint8Array;
    lock_type: number;
}

interface ProcessedIxObject {
    nonce?: number | bigint;

    sender?: Uint8Array;
    payer?: Uint8Array;

    fuel_price?: number | bigint;
    fuel_limit?: number | bigint;
    
    funds: ProcessedIxAssetFund[]
    ix_operations: ProcessedIxOperation[]
    participants: ProcessedIxParticipant[]

    perception?: Uint8Array

    preferences?: ProcessedIxPreferences
}
