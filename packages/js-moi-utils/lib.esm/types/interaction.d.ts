import type { LockType } from "../enums";
import type { Hex } from "../hex";
import type { AnyIxOperation, IxRawOperation } from "./ix-operation";
export interface RawSender {
    id: Uint8Array;
    sequence: number;
    key_id: number;
}
export interface Sender {
    id: Hex;
    sequence: number;
    key_id: number;
}
export interface RawParticipants {
    id: Uint8Array;
    lock_type: LockType;
    notary: boolean;
}
export interface IxParticipant {
    id: Hex;
    lock_type: LockType;
    notary: boolean;
}
export interface IxConsensusPreference {
    mtq: number;
    trust_nodes: string[];
}
export interface RawPreference {
    compute: Uint8Array;
    consensus: IxConsensusPreference;
}
export interface IxPreference {
    compute: Hex;
    consensus: IxConsensusPreference;
}
export interface RawInteractionRequest {
    sender: RawSender;
    sponsor?: RawSender;
    fuel_price: number;
    fuel_limit: number;
    ix_operations: IxRawOperation[];
    participants?: RawParticipants[];
    preferences?: RawPreference;
    perception?: Uint8Array;
}
export interface InteractionRequest {
    /**
     * The entity initiating the interaction.
     */
    sender: Sender;
    /**
     * The entity responsible for paying for the interaction.
     */
    sponsor?: Sender;
    /**
     * The price multiplier for fuel for the interaction.
     */
    fuel_price: number;
    /**
     * The maximum amount of fuel that can be used for the interaction.
     */
    fuel_limit: number;
    /**
     * Represents an array of raw operations to be executed in the interaction
     */
    operations: AnyIxOperation[];
    /**
     * It represents a participant with an addresses and their lock type.
     */
    participants?: IxParticipant[];
    /**
     * It represents compute and consensus preferences for the interaction.
     */
    preferences?: IxPreference;
    /**
     * The perception data for the interaction.
     */
    perception?: Hex;
}
//# sourceMappingURL=interaction.d.ts.map