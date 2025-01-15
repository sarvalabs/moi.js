import { type Hex, type Interaction, type InteractionConfirmation, type OperationItem } from "js-moi-utils";
import type { Provider } from "../types/provider";
interface TimerOption {
    retries: number;
    delayInSec: number;
}
export declare class InteractionResponse {
    readonly hash: Hex;
    private interaction?;
    private readonly provider;
    constructor(interaction: Interaction, provider: Provider);
    constructor(hash: Hex, provider: Provider);
    private getDefaultTimer;
    /**
     * Waits for an interaction to be finalized by polling the provider at specified intervals.
     *
     * @param timer - The timer options for polling, including the number of retries and delay between retries in seconds.
     * @returns A promise that resolves to the interaction confirmation when the interaction is finalized.
     *
     * @throws Will throw a timeout error if the interaction is not finalized within the specified retries.
     */
    wait(timer?: TimerOption): Promise<InteractionConfirmation>;
    /**
     * Retrieves the result of an operation after waiting for a specified duration.
     *
     * @param {TimerOption} [timer=this.getDefaultTimer()] - The timer option to wait for before retrieving the result. Defaults to the value returned by `getDefaultTimer()`.
     * @returns {Promise<OperationItem[]>} A promise that resolves to an array of `OperationItem` objects representing the operations.
     */
    result(timer?: TimerOption): Promise<OperationItem[]>;
}
export {};
//# sourceMappingURL=interaction-response.d.ts.map