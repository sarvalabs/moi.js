import { CustomError, ErrorCode, ErrorUtils, type AnyIxOperationResult, type Hex, type Interaction, type InteractionConfirmation } from "js-moi-utils";
import type { Provider } from "../types/provider";

const INITIAL_NOT_FOUND_RETRIES = 10;
const ASSUMPTION_TIME_DURATION_FOR_GETTING_IX_INFO = 1500;

export interface TimerOption {
    retries: number;
    delayInSec: number;
}

export class InteractionResponse {
    public readonly hash: Hex;
    private interaction?: Interaction;
    private readonly provider: Provider;
    private notFoundRetries = INITIAL_NOT_FOUND_RETRIES;

    constructor(interaction: Interaction, provider: Provider);
    constructor(hash: Hex, provider: Provider);
    constructor(hash: Hex | Interaction, provider: Provider) {
        this.provider = provider;

        if (typeof hash === "string") {
            this.hash = hash;
            return;
        }

        this.interaction = hash;
        this.hash = this.interaction.hash;
    }

    private getDefaultTimer(): TimerOption {
        return { delayInSec: 1.5, retries: 80 };
    }

    /**
     * Waits for an interaction to be finalized by polling the provider at specified intervals.
     *
     * @param timer - The timer options for polling, including the number of retries and delay between retries in seconds.
     * @returns A promise that resolves to the interaction confirmation when the interaction is finalized.
     *
     * @throws Will throw a timeout error if the interaction is not finalized within the specified retries.
     */
    async wait(timer: TimerOption = this.getDefaultTimer()): Promise<InteractionConfirmation> {
        if (timer.retries <= 0) {
            ErrorUtils.throwArgumentError("Must have at least 1 retry", "timer.retries", timer.retries);
        }

        if (timer.delayInSec <= 0) {
            ErrorUtils.throwArgumentError("Delay must be greater than 0", "timer.delayInSec", timer.delayInSec);
        }

        if (this.interaction && this.interaction.confirmation != null) {
            return this.interaction.confirmation;
        }

        const delayInMs = timer.delayInSec * 1000;
        for (let retries = 0; retries < timer.retries; retries++) {
            try {
                const ix = await this.provider.getInteraction(this.hash, {
                    modifier: { include: ["confirmation"] },
                });

                if (this.notFoundRetries === INITIAL_NOT_FOUND_RETRIES) {
                    this.notFoundRetries = INITIAL_NOT_FOUND_RETRIES;
                }

                if (ix.confirmation != null) {
                    this.interaction = ix;
                    return ix.confirmation;
                }
            } catch (error) {
                if (error instanceof CustomError && error.message === "error fetching interaction") {
                    if (this.notFoundRetries <= 0) {
                        ErrorUtils.throwError(`Interaction not found. Hash ${this.hash}`, ErrorCode.ACTION_REJECTED, {
                            hash: this.hash,
                        });
                    }

                    this.notFoundRetries--;
                    await new Promise((resolve) => setTimeout(resolve, ASSUMPTION_TIME_DURATION_FOR_GETTING_IX_INFO));
                    continue;
                }
            }

            timer.retries--;
            await new Promise((resolve) => setTimeout(resolve, delayInMs));
        }

        ErrorUtils.throwError("Timeout", ErrorCode.TIMEOUT);
    }

    /**
     * Retrieves the result of an operation after waiting for a specified duration.
     *
     * @param {TimerOption} [timer=this.getDefaultTimer()] - The timer option to wait for before retrieving the result. Defaults to the value returned by `getDefaultTimer()`.
     * @returns {Promise<OperationItem[]>} A promise that resolves to an array of `OperationItem` objects representing the operations.
     */
    async result(timer: TimerOption = this.getDefaultTimer()): Promise<AnyIxOperationResult[]> {
        const confirmation = await this.wait(timer);
        return confirmation.operations;
    }
}
