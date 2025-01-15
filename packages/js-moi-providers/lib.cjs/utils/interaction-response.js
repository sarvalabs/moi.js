"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractionResponse = void 0;
const js_moi_utils_1 = require("js-moi-utils");
class InteractionResponse {
    hash;
    interaction;
    provider;
    constructor(hash, provider) {
        this.provider = provider;
        if (typeof hash === "string") {
            this.hash = hash;
            return;
        }
        this.interaction = hash;
        this.hash = this.interaction.hash;
    }
    getDefaultTimer() {
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
    async wait(timer = this.getDefaultTimer()) {
        if (timer.retries <= 0) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Must have at least 1 retry", "timer.retries", timer.retries);
        }
        if (timer.delayInSec <= 0) {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Delay must be greater than 0", "timer.delayInSec", timer.delayInSec);
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
                if (ix.status === js_moi_utils_1.InteractionStatus.Finalized) {
                    this.interaction = ix;
                    return ix.confirmation;
                }
            }
            catch (error) {
                // TODO: Here can be bug, when hash is generated, but maybe if we
                // immediately call getInteraction, it will may be not found
                // result in below error, so we need to handle this case.
                // This need to tested in devnet if work as expected.
                // Then this comment can be removed.
                if (error instanceof js_moi_utils_1.CustomError && error.message === "error fetching interaction") {
                    js_moi_utils_1.ErrorUtils.throwError("Interaction not found", js_moi_utils_1.ErrorCode.ACTION_REJECTED);
                }
            }
            timer.retries--;
            await new Promise((resolve) => setTimeout(resolve, delayInMs));
        }
        js_moi_utils_1.ErrorUtils.throwError("Timeout", js_moi_utils_1.ErrorCode.TIMEOUT);
    }
    /**
     * Retrieves the result of an operation after waiting for a specified duration.
     *
     * @param {TimerOption} [timer=this.getDefaultTimer()] - The timer option to wait for before retrieving the result. Defaults to the value returned by `getDefaultTimer()`.
     * @returns {Promise<OperationItem[]>} A promise that resolves to an array of `OperationItem` objects representing the operations.
     */
    async result(timer = this.getDefaultTimer()) {
        const confirmation = await this.wait(timer);
        return confirmation.operations;
    }
}
exports.InteractionResponse = InteractionResponse;
//# sourceMappingURL=interaction-response.js.map