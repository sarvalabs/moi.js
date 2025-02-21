import type { Identifier } from "js-moi-identifiers";
import { ExecuteIx, InteractionResponse, Provider, SimulateOption, type SimulateInteractionRequest } from "js-moi-providers";
import { ErrorCode, ErrorUtils, hexToBytes, isHex, validateIxRequest, type AnyIxOperation, type Hex, type InteractionRequest, type Sender, type Simulate } from "js-moi-utils";
import type { SigningAlgorithms, SigType } from "../types";
import ECDSA_S256 from "./ecdsa";
import Signature from "./signature";

export type SignerIx<T extends InteractionRequest | SimulateInteractionRequest> = Omit<T, "sender" | "fuel_price" | "fuel_limit"> & {
    sender?: Partial<Omit<Sender, "id">>;
    fuel_price?: InteractionRequest["fuel_price"];
} & (T extends InteractionRequest ? { fuel_limit?: InteractionRequest["fuel_limit"] } : {});

const DEFAULT_FUEL_PRICE = 1;

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
export abstract class Signer {
    private provider?: Provider;

    /**
     * The signing algorithms that the signer supports.
     * By default, the signer supports the `ecdsa_secp256k1` algorithm.
     */
    public signingAlgorithms: SigningAlgorithms;

    private fuelPrice = DEFAULT_FUEL_PRICE;

    constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms) {
        this.provider = provider;

        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ECDSA_S256(),
        };
    }

    /**
     * Sets the fuel price for the signer.
     *
     * @param {number} fuelPrice - The fuel price to set.
     * @returns {void}
     * @throws {Error} if the fuel price is less than 1.
     */
    public setFuelPrice(fuelPrice: number): void {
        if (fuelPrice < 1) {
            ErrorUtils.throwError("Fuel price must be greater than or equal to 1", ErrorCode.INVALID_ARGUMENT, { fuelPrice });
        }

        this.fuelPrice = fuelPrice;
    }

    /**
     * Returns the key ID of the signer.
     *
     * @returns {Promise<number>} A promise that resolves to the key ID of the signer.
     */
    public abstract getKeyId(): Promise<number>;

    /**
     * Returns the identifier of the signer.
     *
     * @returns {Promise<Identifier>} A promise that resolves to the identifier of the signer.
     */
    public abstract getIdentifier(): Promise<Identifier>;

    /**
     * Signs a message using the provided signature type.
     *
     * @param {Hex|Uint8Array} message - The message to sign.
     * @param {SigType} sig - The signature type to use.
     *
     * @returns {Promise<Hex>} A promise that resolves to the signed message.
     */
    public abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;

    /**
     * Signs an interaction request using the provided signature type.
     *
     * @param {InteractionRequest} ix - The interaction request to sign.
     * @param {SigType} sig - The signature type to use.
     *
     * @returns {Promise<ExecuteIx>} A promise that resolves to the signed interaction request.
     */
    public abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;

    /**
     * Connects the signer to a provider.
     *
     * @param {Provider} provider - The provider to connect to.
     */
    public connect(provider: Provider): void {
        this.provider = provider;
    }

    /**
     * Returns the provider that the signer is connected to.
     *
     * @returns {Provider} The provider that the signer is connected to.
     *
     * @throws {Error} if the provider is not initialized.
     */
    public getProvider(): Provider {
        if (this.provider) {
            return this.provider;
        }

        ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
    }

    private async getLatestSequence() {
        const [participant, index] = await Promise.all([this.getIdentifier(), this.getKeyId()]);
        const { sequence } = await this.getProvider().getAccountKey(participant, index);
        return sequence;
    }

    private async createIxRequestSender(sender?: Partial<Omit<Sender, "id">>): Promise<Sender> {
        if (sender == null) {
            const [participant, index, sequenceId] = await Promise.all([this.getIdentifier(), this.getKeyId(), this.getLatestSequence()]);

            return { id: participant.toHex(), key_id: index, sequence: sequenceId };
        }

        return {
            id: (await this.getIdentifier()).toHex(),
            key_id: sender.key_id ?? (await this.getKeyId()),
            sequence: sender.sequence ?? (await this.getLatestSequence()),
        };
    }

    private async createSimulateIxRequest(arg: SignerIx<SimulateInteractionRequest> | AnyIxOperation | AnyIxOperation[]): Promise<SimulateInteractionRequest> {
        // request was array of operations
        if (Array.isArray(arg)) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: this.fuelPrice,
                operations: arg,
            };
        }

        // request was single operation
        if (typeof arg === "object" && "type" in arg && "payload" in arg) {
            return {
                sender: await this.createIxRequestSender(),
                fuel_price: this.fuelPrice,
                operations: [arg],
            };
        }

        // request was simulate interaction request without `sender` and `fuel_price`
        return {
            ...arg,
            sender: await this.createIxRequestSender(arg.sender),
            fuel_price: arg.fuel_price ?? this.fuelPrice,
        };
    }

    /**
     * Creates an interaction request for either `moi.Simulate`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<SimulateInteractionRequest>} A promise that resolves to the created interaction request.
     */
    public async createIxRequest(type: "moi.Simulate", args: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<SimulateInteractionRequest>;
    /**
     * Creates an interaction request for either `moi.Execute`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<InteractionRequest>} A promise that resolves to the created interaction request.
     */
    public async createIxRequest(type: "moi.Execute", args: SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<InteractionRequest>;
    /**
     * Creates an interaction request for either `moi.Simulate` or `moi.Execute`
     *
     * @param {string} type - The type of interaction request to create.
     * @param {SignerIx<InteractionRequest | SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation} args - The arguments to create the interaction request.
     *
     * @returns {Promise<SimulateInteractionRequest | InteractionRequest>} A promise that resolves to the created interaction request.
     */
    public async createIxRequest(
        type: "moi.Simulate" | "moi.Execute",
        args: SignerIx<InteractionRequest | SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation
    ): Promise<SimulateInteractionRequest | InteractionRequest> {
        const simulateIxRequest = await this.createSimulateIxRequest(args);
        
        if (type === "moi.Simulate") {
            return simulateIxRequest;
        }

        if (typeof args === "object" && "fuel_limit" in args && typeof args.fuel_limit === "number") {
            return { ...simulateIxRequest, fuel_limit: args.fuel_limit };
        }

        const simulation = await this.simulate(simulateIxRequest);
        const executeIxRequest = {
            ...simulateIxRequest,
            fuel_limit: simulation.effort,
        };

        const err = validateIxRequest("moi.Execute", executeIxRequest);

        if (err != null) {
            ErrorUtils.throwError(`Invalid interaction request: ${err.message}`, ErrorCode.INVALID_ARGUMENT, { ...err });
        }

        return executeIxRequest;
    }

    /**
     * Simulates an operation
     *
     * @param {AnyIxOperation} operation - The operation to simulate.
     * @param {SimulateOption} options - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    public async simulate(operation: AnyIxOperation, options?: SimulateOption): Promise<Simulate>;
    /**
     * Simulates multiple operations
     *
     * @param {AnyIxOperation[]} operations - The operations to simulate.
     * @param {SimulateOption} options - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    public async simulate(operations: AnyIxOperation[], options?: SimulateOption): Promise<Simulate>;
    /**
     * Simulates an interaction request
     *
     * @param {SignerIx<SimulateInteractionRequest>} ix - The interaction request to simulate.
     * @param {SimulateOption} option - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     */
    public async simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    /**
     * It a polymorphic function that can simulate an operation, multiple operations, or an interaction request.
     *
     * @param {AnyIxOperation | AnyIxOperation[] | SignerIx<SimulateInteractionRequest>} arg - The operation, multiple operations, or interaction request to simulate.
     * @param {SimulateOption} option - The options to use for simulation.
     *
     * @returns {Promise<Simulate>} A promise that resolves to the simulation result.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType, Wallet } from "js-moi-sdk";
     *
     * const host = "https://voyage-rpc.moi.technology/babylon/";
     * const provider = new HttpProvider(host);
     * const wallet = await Wallet.createRandom(provider);
     * const operation = {
     *     type: OpType.AssetCreate,
     *     payload: {
     *         standard: AssetStandard.MAS0,
     *         supply: 1000000,
     *         symbol: "DUMMY",
     *     },
     * };
     *
     * const simulation = await wallet.simulate(operation);
     */
    public async simulate(arg: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation, option?: SimulateOption): Promise<Simulate> {
        const request = await this.createIxRequest("moi.Simulate", arg);

        return await this.getProvider().simulate(request, option);
    }

    /**
     * Executes an operation.
     *
     * @param {AnyIxOperation} operation - The operation to execute
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    public async execute(operation: AnyIxOperation): Promise<InteractionResponse>;
    /**
     * Executes multiple operations.
     *
     * @param {AnyIxOperation[]} operations - The operations to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    public async execute(operations: AnyIxOperation[]): Promise<InteractionResponse>;
    /**
     * Executes an interaction request.
     *
     * @param {SignerIx<InteractionRequest>} ix - The interaction request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    public async execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse>;
    /**
     * Executes an signed interaction request.
     *
     * @param {ExecuteIx} arg - The signed interaction request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     */
    public async execute(request: ExecuteIx): Promise<InteractionResponse>;
    /**
     * Executes an operation, multiple operations, or an interaction request.
     *
     * @param {AnyIxOperation | AnyIxOperation[] | SignerIx<InteractionRequest> | ExecuteIx} arg - The operation, multiple operations, interaction request, or already signed request to execute.
     *
     * @returns {Promise<InteractionResponse>} A promise that resolves to the interaction response.
     *
     * @throws {Error} if the sequence number is outdated or the interaction request is invalid.
     *
     * @example
     * import { AssetStandard, HttpProvider, OpType, Wallet } from "js-moi-sdk";
     *
     * const host = "https://voyage-rpc.moi.technology/babylon/";
     * const provider = new HttpProvider(host);
     * const wallet = await Wallet.createRandom(provider);
     * const operation = {
     *     type: OpType.AssetCreate,
     *     payload: {
     *         standard: AssetStandard.MAS0,
     *         supply: 1000000,
     *         symbol: "DUMMY",
     *     },
     * };
     *
     * const ix = await wallet.execute(operation);
     * console.log(ix.hash);
     *
     * >> "0xfe1...19"
     */
    public async execute(arg: SignerIx<InteractionRequest> | AnyIxOperation | AnyIxOperation[] | ExecuteIx): Promise<InteractionResponse> {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;

        // checking argument is an already signed request
        if (typeof arg === "object" && "interaction" in arg && "signatures" in arg) {
            if (!isHex(arg.interaction)) {
                ErrorUtils.throwError("Invalid interaction provided. Not a valid hex.", ErrorCode.INVALID_ARGUMENT, {
                    interaction: arg.interaction,
                });
            }

            if (!Array.isArray(arg.signatures)) {
                ErrorUtils.throwError("Invalid signatures provided. Not an array.", ErrorCode.INVALID_ARGUMENT, {
                    signatures: arg.signatures,
                });
            }

            return await this.getProvider().execute(arg);
        }

        const request = await this.createIxRequest("moi.Execute", arg);

        if (request.sender.sequence < (await this.getLatestSequence())) {
            ErrorUtils.throwError("Sequence number is outdated", ErrorCode.SEQUENCE_EXPIRED);
        }

        const error = validateIxRequest("moi.Execute", request);

        if (error != null) {
            ErrorUtils.throwError(`Invalid interaction request: ${error.message}`, ErrorCode.INVALID_ARGUMENT, error);
        }

        const signedRequest = await this.signInteraction(request, algorithm);

        return await this.getProvider().execute(signedRequest);
    }

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
    public verify(message: Uint8Array, signature: string | Uint8Array, publicKey: string | Uint8Array): boolean {
        let verificationKey: Uint8Array;

        if (typeof publicKey === "string") {
            verificationKey = hexToBytes(publicKey as string);
        } else {
            verificationKey = publicKey as Uint8Array;
        }

        if (verificationKey.length === 33) {
            verificationKey = verificationKey.slice(1);
        }

        const sig = new Signature();
        sig.unmarshall(signature);

        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];

                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
