"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signer = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ecdsa_1 = __importDefault(require("./ecdsa"));
const signature_1 = __importDefault(require("./signature"));
// /**
//  * An abstract class representing a signer responsible for cryptographic
//  * activities like signing and verification.
//  */
// export abstract class Signer {
//     public provider?: Provider;
//     public signingAlgorithms: SigningAlgorithms;
//     constructor(provider?: Provider, signingAlgorithms?: SigningAlgorithms) {
//         this.provider = provider;
//         this.signingAlgorithms = signingAlgorithms ?? {
//             ecdsa_secp256k1: new ECDSA_S256(),
//         };
//     }
//     abstract getAddress(): string;
//     abstract sign(message: Hex): Hex;
//     abstract isInitialized(): boolean;
//     abstract signIx(ix: InteractionRequest, sigAlgo: SigType): unknown;
//     connect(provider: Provider): void {
//         this.provider = provider;
//     }
//     /**
//      * Retrieves the connected provider instance.
//      *
//      * @returns The connected provider instance.
//      * @throws {Error} if the provider is not initialized.
//      */
//     public getProvider() {
//         if (this.provider) {
//             return this.provider;
//         }
//         ErrorUtils.throwError("Provider is not initialized!", ErrorCode.NOT_INITIALIZED);
//     }
//     public async simulate(ix: InteractionRequest, option?: SimulateOption) {
//         return await this.getProvider().simulate(ix, option);
//     }
//     public async signInteraction(ix: InteractionRequest) {
//         return this.sign(bytesToHex(interaction(ix)));
//     }
//     public async execute(ix: InteractionRequest) {
//         const signature = this.signInteraction(ix);
//     }
// }
class Signer {
    provider;
    signingAlgorithms;
    constructor(provider, signingAlgorithms) {
        this.provider = provider;
        this.signingAlgorithms = signingAlgorithms ?? {
            ecdsa_secp256k1: new ecdsa_1.default(),
        };
    }
    connect(provider) {
        this.provider = provider;
    }
    getProvider() {
        if (this.provider) {
            return this.provider;
        }
        js_moi_utils_1.ErrorUtils.throwError("Provider is not initialized!", js_moi_utils_1.ErrorCode.NOT_INITIALIZED);
    }
    async getLatestSequence() {
        // TODO: Check whether it is correct way to get latest sequence
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyIndex()]);
        const { sequence } = await this.getProvider().getAccountKey(address, index);
        return sequence;
    }
    async getSender(sequence) {
        if (sequence != null) {
            const latest = await this.getLatestSequence();
            if (sequence < latest) {
                js_moi_utils_1.ErrorUtils.throwError("Sequence number is outdated", js_moi_utils_1.ErrorCode.SEQUENCE_EXPIRED);
            }
        }
        if (sequence == null) {
            sequence = await this.getLatestSequence();
        }
        const [address, index] = await Promise.all([this.getAddress(), this.getKeyIndex()]);
        return { address, key_id: index, sequence_id: sequence };
    }
    async execute(ix, sequence) {
        const { ecdsa_secp256k1: algorithm } = this.signingAlgorithms;
        const interaction = { ...ix, sender: await this.getSender(sequence) };
        console.log(JSON.stringify(interaction, null, 2));
        const signedIx = await this.signInteraction(interaction, algorithm);
        return await this.getProvider().execute(signedIx);
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
    verify(message, signature, publicKey) {
        let verificationKey;
        if (typeof publicKey === "string") {
            verificationKey = (0, js_moi_utils_1.hexToBytes)(publicKey);
        }
        else {
            verificationKey = publicKey;
        }
        if (verificationKey.length === 33) {
            verificationKey = verificationKey.slice(1);
        }
        const sig = new signature_1.default();
        sig.unmarshall(signature);
        switch (sig.getSigByte()) {
            case 1: {
                const _sig = this.signingAlgorithms["ecdsa_secp256k1"];
                return _sig.verify(message, sig, verificationKey);
            }
            default: {
                js_moi_utils_1.ErrorUtils.throwError("Invalid signature provided. Unable to verify the signature.", js_moi_utils_1.ErrorCode.INVALID_SIGNATURE);
            }
        }
    }
}
exports.Signer = Signer;
//# sourceMappingURL=signer.js.map