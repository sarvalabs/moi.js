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
/**
 * This is an abstract class that provides the base functionality for
 * signing and verifying messages and interactions. It also provides the ability to
 * create and execute interactions.
 *
 * Inheriting classes must implement the abstract methods ``getKeyId``, ``getIdentifier``,
 * ``sign``, and ``signInteraction``.
 *
 * .. js:method:: getKeyId
 *
 *      Retrieves the key ID of the participant.
 *
 *      `This is an abstract method that must be implemented by the inheriting class.`
 *
 *      :returns: A promise that resolves to the key ID of the participant.
 *
 * .. js:method:: getIdentifier
 *
 *      Retrieves the identifier of the participant.
 *
 *      `This is an abstract method that must be implemented by the inheriting class.`
 *
 *      :returns: A promise that resolves to the identifier of the signer.
 *
 * .. js:method:: sign
 *
 *      Signs a message using the provided signature type.
 *
 *      `This is an abstract method that must be implemented by the inheriting class.`
 *
 *      :param message: The message to sign.
 *      :type message: Hex | Uint8Array
 *      :param sig: The signature type to use.
 *      :type sig: SigType
 *
 *      :returns: A promise that resolves to the hex-encoded signed message.
 *
 * .. js:method:: signInteraction
 *
 *      Signs an interaction request using the provided signature type.
 *
 *      `This is an abstract method that must be implemented by the inheriting class.`
 *
 *      :param ix: The interaction request to sign.
 *      :type ix: InteractionRequest
 *      :param sig: The signature type to use.
 *      :type sig: SigType
 *
 *      :returns: A promise that resolves to the signed interaction request.
 *
 */
export declare abstract class Signer {
    private provider?;
    /**
     * The signing algorithms that the signer supports.
     * By default, the signer supports the `ecdsa_secp256k1` algorithm.
     */
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
    /**
     * Returns the key ID of the signer.
     *
     * @returns {Promise<number>} A promise that resolves to the key ID of the signer.
     */
    abstract getKeyId(): Promise<number>;
    /**
     * Returns the identifier of the signer.
     *
     * @returns {Promise<Identifier>} A promise that resolves to the identifier of the signer.
     */
    abstract getIdentifier(): Promise<Identifier>;
    /**
     * Signs a message using the provided signature type.
     *
     * @param {Hex|Uint8Array} message - The message to sign.
     * @param {SigType} sig - The signature type to use.
     *
     * @returns {Promise<Hex>} A promise that resolves to the signed message.
     */
    abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;
    /**
     * Signs an interaction request using the provided signature type.
     *
     * @param {InteractionRequest} ix - The interaction request to sign.
     * @param {SigType} sig - The signature type to use.
     *
     * @returns {Promise<ExecuteIx>} A promise that resolves to the signed interaction request.
     */
    abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;
    /**
     * Connects the signer to a provider.
     *
     * @param {Provider} provider - The provider to connect to.
     */
    connect(provider: Provider): void;
    /**
     * Returns the provider that the signer is connected to.
     *
     * @returns {Provider} The provider that the signer is connected to.
     *
     * @throws {Error} if the provider is not initialized.
     */
    getProvider(): Provider;
    private getLatestSequence;
    private createIxRequestSender;
    private createSimulateIxRequest;
    /**
     * Creates an interaction request for either `moi.Simulate`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<SimulateInteractionRequest>} A promise that resolves to the created interaction request.
     */
    createIxRequest(type: "moi.Simulate", args: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<SimulateInteractionRequest>;
    /**
     * Creates an interaction request for either `moi.Execute`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<InteractionRequest>} A promise that resolves to the created interaction request.
     */
    createIxRequest(type: "moi.Execute", args: SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<InteractionRequest>;
    /**
     * Simulates an operation
     *
     * @param {AnyIxOperation} operation - The operation to simulate.
     * @param {SimulateOption} options - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    simulate(operation: AnyIxOperation, options?: SimulateOption): Promise<Simulate>;
    /**
     * Simulates multiple operations
     *
     * @param {AnyIxOperation[]} operations - The operations to simulate.
     * @param {SimulateOption} options - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    simulate(operations: AnyIxOperation[], options?: SimulateOption): Promise<Simulate>;
    /**
     * Simulates an interaction request
     *
     * @param {SignerIx<SimulateInteractionRequest>} ix - The interaction request to simulate.
     * @param {SimulateOption} option - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    /**
     * Executes an operation.
     *
     * @param {AnyIxOperation} operation - The operation to execute
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    execute(operation: AnyIxOperation): Promise<InteractionResponse>;
    /**
     * Executes multiple operations.
     *
     * @param {AnyIxOperation[]} operations - The operations to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    execute(operations: AnyIxOperation[]): Promise<InteractionResponse>;
    /**
     * Executes an interaction request.
     *
     * @param {SignerIx<InteractionRequest>} ix - The interaction request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse>;
    /**
     * Executes an signed interaction request.
     *
     * @param {ExecuteIx} arg - The signed interaction request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    execute(request: ExecuteIx): Promise<InteractionResponse>;
    /**
     * Verifies the authenticity of a signature by performing signature verification
     * using the provided parameters.
     *
     * @param {Uint8Array} message - The message that was signed.
     * @param {string|Uint8Array} signature - The signature to verify, as a string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for verification, as a string or Buffer.
     * @returns {boolean} A boolean indicating whether the signature is valid or not.
     * @throws {Error} if the signature is invalid or the signature byte is not recognized.
     */
    verify(message: Uint8Array, signature: string | Uint8Array, publicKey: string | Uint8Array): boolean;
}
//# sourceMappingURL=signer.d.ts.map