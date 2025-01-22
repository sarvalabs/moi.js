import { HttpProvider, InteractionResponse, JsonRpcProvider, WebsocketProvider, type Provider } from "js-moi-providers";
import type { SigType } from "js-moi-signer";
import { AssetStandard, bytesToHex, ensureHexPrefix, hexToBytes, isHex, OpType, ReceiptStatus, type InteractionRequest, type IxOp } from "js-moi-utils";
import { CURVE, Wallet } from "../src.ts";

const TEST_TIMEOUT = 2 * 60_000;

describe(Wallet, () => {
    const MNEMONIC = "profit behave tribe dash diet stool crawl general country student smooth oxygen";
    const ADDRESS = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
    const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
    const PRIVATE_KEY = "879b415fc8ef34da94aa62a26345b20ea76f7cc9d5485fda428dfe2d6b6d158c";

    it.concurrent("should create a wallet from a constructor", async () => {
        const wallet = new Wallet(PRIVATE_KEY, CURVE.SECP256K1);

        expect(wallet).toBeInstanceOf(Wallet);
        expect(await wallet.getAddress()).toEqual(ADDRESS);
        expect(wallet.privateKey).toEqual(PRIVATE_KEY);
        expect(wallet.mnemonic).not.toBeDefined();
    });

    it.concurrent("should throw error creating wallet if curve is not supported", async () => {
        expect(() => new Wallet(PRIVATE_KEY, "unknown" as CURVE)).toThrow();
        expect(() => new Wallet(PRIVATE_KEY, "" as CURVE)).toThrow();
    });

    it.concurrent("should throw error creating wallet if private key is invalid", async () => {
        expect(() => new Wallet(2 as any, CURVE.SECP256K1)).toThrow();
        expect(() => new Wallet(true as any, CURVE.SECP256K1)).toThrow();
        expect(() => new Wallet("", CURVE.SECP256K1)).toThrow();
    });

    it.concurrent("should throw error creating a wallet from invalid mnemonic", async () => {
        await expect(Wallet.fromMnemonic("")).rejects.toThrow();
        await expect(Wallet.fromMnemonic("a b c d e f g h i j k l")).rejects.toThrow();
        await expect(Wallet.fromMnemonic(null!)).rejects.toThrow();
    });

    it.concurrent("should throw error creating a wallet from invalid mnemonic", async () => {
        expect(() => Wallet.fromMnemonicSync("")).toThrow();
        expect(() => Wallet.fromMnemonicSync("a b c d e f g h i j k l")).toThrow();
        expect(() => Wallet.fromMnemonicSync(null!)).toThrow();
    });

    it.concurrent.each([
        { name: "synchronously when path and option are passed", createWallet: () => Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH, {}) },
        { name: "asynchronously when path and option are provided", createWallet: async () => await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH, {}) },
    ])("should create a wallet from a mnemonic $name", async ({ createWallet }) => {
        const wallet = await createWallet();

        expect(wallet).toBeInstanceOf(Wallet);
        expect(await wallet.getAddress()).toEqual(ADDRESS);
        expect(wallet.privateKey).toEqual(PRIVATE_KEY);
        expect(wallet.mnemonic).toEqual(MNEMONIC);
        expect(wallet.curve).toEqual(CURVE.SECP256K1);
    });

    it.concurrent.each([
        { name: "synchronously", createWallet: () => Wallet.createRandomSync() },
        { name: "asynchronously", createWallet: async () => await Wallet.createRandom() },
    ])("should create a random wallet $name", async ({ createWallet }) => {
        const wallet = await createWallet();

        expect(wallet).toBeInstanceOf(Wallet);
        expect(await wallet.getAddress()).toEqual(expect.any(String));
        expect(wallet.privateKey).toEqual(expect.any(String));
        expect(wallet.mnemonic).toEqual(expect.any(String));
        expect(wallet.curve).toEqual(CURVE.SECP256K1);
    });

    const keystore =
        '{"cipher":"aes-128-ctr","ciphertext":"d2574897079cf82af2b48848cdc44ec40bd0d383562978eb50dd032e38b1c90e","cipherparams":{"IV":"5d98f0c4d8562244ee48d063a3d6ce07"},"kdf":"scrypt","kdfparams":{"n":4096,"r":8,"p":1,"dklen":32,"salt":"a99102406c29fdbc79793be3e4e4cae2bbc5c38a05a6e2917228fd6eea2244d9"},"mac":"33d1569f411526447edf1970cb5d61ed097543521024ebafbdd497c1017126f8"}';

    it.concurrent("should create a wallet using keystore and password", async () => {
        const password = "password";
        const wallet = Wallet.fromKeystore(keystore, password);

        expect(wallet).toBeInstanceOf(Wallet);
        expect(await wallet.getAddress()).toEqual(ADDRESS);
        expect(wallet.privateKey).toEqual(PRIVATE_KEY);
        expect(wallet.mnemonic).not.toBeDefined();
        expect(wallet.curve).toEqual(CURVE.SECP256K1);
    });

    it.concurrent("should throw an error if password is incorrect", async () => {
        const password = "wrong";
        const createWallet = () => Wallet.fromKeystore(keystore, password);

        expect(createWallet).toThrow();
    });

    it.concurrent("should throw an error if keystore is invalid", async () => {
        const password = "password";
        const createWallet = () => Wallet.fromKeystore("{}", password);

        expect(createWallet).toThrow();
    });

    let wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
    let algorithm: SigType = wallet.signingAlgorithms.ecdsa_secp256k1;

    describe(wallet.getKeyId, () => {
        it.concurrent("should return the key index", async () => {
            const index = await wallet.getKeyId();

            expect(index).toBeGreaterThanOrEqual(0);
        });
    });

    describe(wallet.sign, () => {
        it.concurrent("should throw an error is signing algorithm not provided", async () => {
            const message = "Hello, MOI";
            const signing = async () => await wallet.sign(new TextEncoder().encode(message), null!);

            expect(signing).rejects.toThrow();
        });

        it.concurrent("should throw an error if unknown signing algorithm provided", async () => {
            const message = "Hello, MOI";
            const algorithm: any = { sigName: "unknown" };
            const signing = async () => await wallet.sign(new TextEncoder().encode(message), algorithm);

            expect(signing).rejects.toThrow();
        });

        it.concurrent("should throw an error if message is invalid", async () => {
            await expect(wallet.sign(null!, algorithm)).rejects.toThrow();
            await expect(wallet.sign("" as any, algorithm)).rejects.toThrow();
            await expect(wallet.sign(1 as any, algorithm)).rejects.toThrow();
            await expect(wallet.sign("invalid" as any, algorithm)).rejects.toThrow();
        });

        const message = "Hello, MOI";

        it.concurrent("should sign a message using ECDSA secp256k1", async () => {
            const signature = await wallet.sign(new TextEncoder().encode(message), algorithm);
            const expected = "0x0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";

            expect(signature).toEqual(expected);
        });

        it.concurrent("should be able to sign a message when message in a hex string", async () => {
            const signature = await wallet.sign(bytesToHex(new TextEncoder().encode(message)), algorithm);
            const expected = "0x0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";

            expect(signature).toEqual(expected);
        });
    });

    describe(wallet.generateKeystore, () => {
        it.concurrent("should generate a keystore using a password", async () => {
            const password = "password";
            const keystore = wallet.generateKeystore(password);
            const wallet2 = Wallet.fromKeystore(JSON.stringify(keystore), password);

            expect(keystore).toBeDefined();
            expect(wallet2.privateKey).toEqual(wallet.privateKey);
            expect(wallet2.publicKey).toEqual(wallet.publicKey);
        });

        it.concurrent("should throw an error if password is not provided", async () => {
            const generate = () => wallet.generateKeystore(null!);

            expect(generate).toThrow();
        });
    });

    describe(wallet.getProvider, () => {
        const wallet = Wallet.createRandomSync();

        it.concurrent("should error if provider is not set", async () => {
            const getProvider = () => wallet.getProvider();

            expect(getProvider).toThrow();
        });

        it.concurrent("should return the provider", async () => {
            const provider = new HttpProvider("http://localhost:8545");
            wallet.connect(provider);

            expect(wallet.getProvider()).toBeInstanceOf(JsonRpcProvider);
        });
    });

    describe(wallet.verify, () => {
        it.concurrent("should be verify a signature using ECDSA secp256k1", async () => {
            const message = "Hello, MOI";
            const signature =
                "0x0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";
            const ok = wallet.verify(new TextEncoder().encode(message), signature, wallet.publicKey);

            expect(ok).toBeTruthy();
        });

        it.concurrent("should be able to verify when public key in byte array", async () => {
            const message = new TextEncoder().encode("Hello, MOI");
            const signature =
                "0x0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402";
            const ok = wallet.verify(message, signature, hexToBytes(wallet.publicKey));

            expect(ok).toBeTruthy();
        });

        it.concurrent("should return false if signature is invalid", async () => {
            const message = "Hello, MOI";
            const signature =
                "0x0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726401";
            const ok = wallet.verify(new TextEncoder().encode(message), signature, wallet.publicKey);

            expect(ok).toBeFalsy();
        });
    });

    describe(wallet.signInteraction, () => {
        const interaction: InteractionRequest = {
            sender: {
                address: ADDRESS,
                key_id: 0,
                sequence_id: 0,
            },
            fuel_price: 1,
            fuel_limit: 100,
            operations: [
                {
                    type: OpType.AssetCreate,
                    payload: {
                        symbol: "MOI",
                        standard: AssetStandard.MAS0,
                        supply: 1000,
                    },
                },
            ],
        };

        it.concurrent("should throw an error is signing algorithm not provided", async () => {
            const signing = async () => await wallet.signInteraction(interaction, null!);

            expect(signing).rejects.toThrow();
        });

        it.concurrent("should throw an error if unknown signing algorithm provided", async () => {
            const algorithm: any = { sigName: "unknown" };
            const signing = async () => await wallet.signInteraction(interaction, algorithm);

            expect(signing).rejects.toThrow();
        });

        it.concurrent("should throw an error if sender address is not the same as wallet address", async () => {
            const ix: InteractionRequest = { ...interaction, sender: { ...interaction.sender, address: "0x123" } };
            const signing = async () => await wallet.signInteraction(ix, algorithm);

            expect(signing).rejects.toThrow();
        });

        it.concurrent("should sign an interaction using ECDSA secp256k1", async () => {
            const { interaction: encoded, signatures } = await wallet.signInteraction(interaction, algorithm);
            const expectedSignature =
                "0x0146304402201781a592e1543d7035c7e2bcc371054fb1b31329c8215990012a27049c802d9402201ed6ac66c334e037fa347a647e7e4a1c64926af67301d8deac71dbaddcf84d6f02";
            const verify = wallet.verify(hexToBytes(encoded), signatures[0].signature, wallet.publicKey);

            expect(isHex(encoded)).toBeTruthy();
            expect(signatures).toHaveLength(1);
            expect(signatures[0].signature).toEqual(expectedSignature);
            expect(verify).toBeTruthy();
        });
    });
});

const getProvider = (): Provider => {
    switch (process.env["PROVIDER_TYPE"]) {
        case "http": {
            if (!process.env["HTTP_PROVIDER_HOST"]) {
                throw new Error("PROVIDER_URL is not set");
            }

            return new HttpProvider(process.env["HTTP_PROVIDER_HOST"]);
        }

        case "ws": {
            if (!process.env["WS_PROVIDER_HOST"]) {
                throw new Error("PROVIDER_URL is not set");
            }

            return new WebsocketProvider(process.env["WS_PROVIDER_HOST"]);
        }

        default: {
            throw new Error(`Unknown provider type: ${process.env["PROVIDER_TYPE"]}`);
        }
    }
};

describe("Provider integration test", () => {
    const it = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it : globalThis.it.skip;
    it.concurrent = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it.concurrent : globalThis.it.concurrent.skip;

    const initWallet = () => {
        if (!process.env["TEST_PRIVATE_KEY"]) {
            throw new Error("TEST_PRIVATE_KEY is not set");
        }

        return new Wallet(ensureHexPrefix(process.env["TEST_PRIVATE_KEY"]), CURVE.SECP256K1, getProvider());
    };

    const wallet = Wallet.createRandomSync(getProvider());

    // Register a new participant.
    beforeAll(async () => {
        const ix = await initWallet().execute({
            fuel_price: 1,
            fuel_limit: 100,
            operations: [
                {
                    type: OpType.ParticipantCreate,
                    payload: {
                        address: await wallet.getAddress(),
                        amount: 100_000,
                        keys_payload: [{ public_key: wallet.publicKey, weight: 1000, signature_algorithm: 0 }],
                    },
                },
            ],
        });

        await ix.wait();
    }, TEST_TIMEOUT);

    const operations: IxOp[] = [
        {
            type: OpType.AssetCreate,
            payload: { symbol: "MOI", standard: AssetStandard.MAS0, supply: 1000 },
        },
    ];

    describe(wallet.simulate, () => {
        it("should be able to simulate a interaction", async () => {
            const simulation = await wallet.simulate({
                fuel_price: 1,
                operations,
            });

            expect(simulation).toBeDefined();
            expect(simulation.result).toHaveLength(1);
        });
    });

    describe(wallet.execute, () => {
        let ix: InteractionResponse;

        beforeAll(async () => {
            ix = await wallet.execute({
                fuel_price: 1,
                fuel_limit: 100,
                operations,
            });
        }, TEST_TIMEOUT);

        it("should be able to execute a interaction", async () => {
            expect(ix).toBeDefined();
            expect(ix).toBeInstanceOf(InteractionResponse);
            expect(isHex(ix.hash)).toBeTruthy();
        });

        it("should be able to get the interaction confirmation", async () => {
            const confirmation = await ix.wait();

            expect(confirmation).toBeDefined();
            expect(confirmation.status).toEqual(ReceiptStatus.Ok);

            for (const operation of operations) {
                expect(confirmation.operations.some((op) => op.type === operation.type)).toBeTruthy();
            }
        });

        it("should be able to get the interaction result", async () => {
            const result = await ix.result();

            expect(result).toBeDefined();
            expect(result).toHaveLength(1);
            expect(result[0].status).toEqual(ReceiptStatus.Ok);
        });
    });
});
