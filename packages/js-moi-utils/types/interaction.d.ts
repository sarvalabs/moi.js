import { OpType } from "../src.ts/interaction";

export interface ContextDelta {
    role: number;
    behavioural_nodes: string[] | null;
    random_nodes: string[] | null;
    replaced_nodes: string[] | null;
}

export interface Participant {
    address: string;
    height: string;
    transitive_link: string;
    prev_context: string;
    latest_context: string;
    context_delta: ContextDelta;
    state_hash: string;
}

export interface Operation {
    type: OpType;
    payload: Uint8Array;
}

export type Participants = Participant[];

export interface Interaction {
    nonce: string;
    
    sender: string;
    payer: string;

    fuel_price: string;
    fuel_limit: string;

    ix_operations: Operation[]
    
    hash: string;
    signature: string;

    ts_hash: string;
    participants: Participant[];
    ix_index: string;
}

export type Interactions = Interaction[];
