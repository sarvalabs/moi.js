import type { Identifier } from "js-moi-identifiers";
import { ExecuteIx, InteractionResponse, Provider, SimulateOption, type SimulateInteractionRequest } from "js-moi-providers";
import { type AnyIxOperation, type Hex, type InteractionRequest, type Sender, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
export type SignerIx<T extends InteractionRequest | SimulateInteractionRequest> = Omit<T, "sender" | "fuel_price" | "fuel_limit"> & {
    sender?: Partial<Omit<Sender, "id">>;
    fuel_price?: InteractionRequest["fuel_price"];
} & (T extends InteractionRequest ? {
    fuel_limit?: InteractionRequest["fuel_limit"];
} : {});
export declare abstract class Signer {
    private provider?;
    signingAlgorithms: SigningAlgorithms;
    private fuelPrice;
    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms);
    /**
     * Sets the fuel price for the signer.
     *
     * @param {number} fuelPrice - The fuel price to set.
     * @returns {void}
     * @throws {Error} if the fuel price is less than 1.
     */
    setFuelPrice(fuelPrice: number): void;
    abstract getKeyId(): Promise<number>;
    abstract getIdentifier(): Promise<Identifier>;
    abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;
    abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;
    connect(provider: Provider): void;
    getProvider(): Provider;
    private getLatestSequence;
    private createIxRequestSender;
    private createSimulateIxRequest;
    createIxRequest(type: "moi.Simulate", args: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<SimulateInteractionRequest>;
    createIxRequest(type: "moi.Execute", args: SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<InteractionRequest>;
    simulate(operation: AnyIxOperation, options?: SimulateOption): Promise<Simulate>;
    simulate(operations: AnyIxOperation[], options?: SimulateOption): Promise<Simulate>;
    simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    execute(operation: AnyIxOperation): Promise<InteractionResponse>;
    execute(operations: AnyIxOperation[]): Promise<InteractionResponse>;
    execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse>;
    execute(request: ExecuteIx): Promise<InteractionResponse>;
    /**
     * Verifies the authenticity of a signature by performing signature verification
     * using the provided parameters.
     *
     * @param {Uint8Array} message - The message that was signed.
     * @param {string|Uint8Array} signature - The signature to verify, as a
     * string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for
     * verification, as a string or Buffer.
     * @returns {boolean} A boolean indicating whether the signature is valid or not.
     * @throws {Error} if the signature is invalid or the signature byte is not recognized.
     */
    verify(message: Uint8Array, signature: string | Uint8Array, publicKey: string | Uint8Array): boolean;
}
//# sourceMappingURL=signer.d.ts.map