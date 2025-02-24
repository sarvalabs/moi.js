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

export abstract class Signer {
    private provider?: Provider;

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

    public abstract getKeyId(): Promise<number>;

    public abstract getIdentifier(): Promise<Identifier>;

    public abstract sign(message: Hex | Uint8Array, sig: SigType): Promise<Hex>;

    public abstract signInteraction(ix: InteractionRequest, sig: SigType): Promise<ExecuteIx>;

    public connect(provider: Provider): void {
        this.provider = provider;
    }

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

    public async createIxRequest(type: "moi.Simulate", args: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<SimulateInteractionRequest>;
    public async createIxRequest(type: "moi.Execute", args: SignerIx<InteractionRequest> | AnyIxOperation[] | AnyIxOperation): Promise<InteractionRequest>;
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
            fuel_limit: simulation.fuel_spent,
        };

        const err = validateIxRequest("moi.Execute", executeIxRequest);

        if (err != null) {
            ErrorUtils.throwError(`Invalid interaction request: ${err.message}`, ErrorCode.INVALID_ARGUMENT, { ...err });
        }

        return executeIxRequest;
    }

    public async simulate(operation: AnyIxOperation, options?: SimulateOption): Promise<Simulate>;
    public async simulate(operations: AnyIxOperation[], options?: SimulateOption): Promise<Simulate>;
    public async simulate(ix: SignerIx<SimulateInteractionRequest>, option?: SimulateOption): Promise<Simulate>;
    public async simulate(arg: SignerIx<SimulateInteractionRequest> | AnyIxOperation[] | AnyIxOperation, option?: SimulateOption): Promise<Simulate> {
        const request = await this.createIxRequest("moi.Simulate", arg);

        return await this.getProvider().simulate(request, option);
    }

    public async execute(operation: AnyIxOperation): Promise<InteractionResponse>;
    public async execute(operations: AnyIxOperation[]): Promise<InteractionResponse>;
    public async execute(ix: SignerIx<InteractionRequest>): Promise<InteractionResponse>;
    public async execute(request: ExecuteIx): Promise<InteractionResponse>;
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
     * @param {string|Uint8Array} signature - The signature to verify, as a
     * string or Buffer.
     * @param {string|Uint8Array} publicKey - The public key used for
     * verification, as a string or Buffer.
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
