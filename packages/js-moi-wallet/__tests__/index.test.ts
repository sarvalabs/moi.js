import { randomBytes } from "crypto";
import { VoyageProvider, type InteractionRequest } from "js-moi-providers";
import { AssetStandard, isValidAddress, OpType } from "js-moi-utils";
import { CURVE, Wallet } from "../src.ts/index";

const MNEMONIC = "profit behave tribe dash diet stool crawl general country student smooth oxygen";
const ADDRESS = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PRIVATE_KEY = "879b415fc8ef34da94aa62a26345b20ea76f7cc9d5485fda428dfe2d6b6d158c";

describe("Wallet", () => {
    describe("constructor", () => {
        test("instance is created with a private key (Buffer type) and a specified curve", async () => {
            const wallet = new Wallet(Buffer.from(PRIVATE_KEY, "hex"), CURVE.SECP256K1);

            expect(wallet).toBeDefined();
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.address).toBe(ADDRESS);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test("Instance is created with a private key (String type) and a specified curve", async () => {
            const wallet = new Wallet(PRIVATE_KEY, CURVE.SECP256K1);

            expect(wallet).toBeDefined();
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.address).toBe(ADDRESS);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });
    });

    describe("Static methods", () => {
        test(Wallet.fromMnemonic.name, async () => {
            const wallet = await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH);

            expect(wallet.address).toBe(ADDRESS);
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.mnemonic).toBe(MNEMONIC);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
        });

        test(Wallet.fromMnemonicSync.name, () => {
            const wallet =  Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);

            expect(wallet.address).toBe(ADDRESS);
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.mnemonic).toBe(MNEMONIC);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test(Wallet.createRandom.name, async () => {
            const wallet = await Wallet.createRandom();

            expect(wallet).toBeDefined();
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.mnemonic.split(" ").length).toBe(12);
            expect(wallet.privateKey).toBeDefined();
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test(Wallet.createRandomSync.name, () => {
            const wallet = Wallet.createRandomSync();

            expect(wallet.isInitialized()).toBe(true);
            expect(wallet).toBeDefined();
            expect(isValidAddress(wallet.address)).toBeTruthy();
            expect(wallet.privateKey).toBeDefined();
            expect(wallet.mnemonic.split(" ").length).toBe(12);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });

        test(Wallet.fromKeystore.name, async () => {
            const keystore = `{
                        "cipher": "aes-128-ctr",
                        "ciphertext": "b241d6a71004b0f73397e4e0e1a324ca7e06b314d7694a092e76c898b48d4d6c",
                        "cipherparams": {
                            "IV": "c7a6284851f604b70a483bdd18c16c5a"
                        },
                        "kdf": "scrypt",
                        "kdfparams": {
                            "n": 4096,
                            "r": 8,
                            "p": 1,
                            "dklen": 32,
                            "salt": "17584125264a5817c6c46fbbb86c1009815261975168b7edc2dd57b175470880"
                        },
                        "mac": "f7b658893365e6f787db31888859c0531f1434a12ba4a10e548ef869c3428780"
                    }`;

            const wallet = Wallet.fromKeystore(keystore, "password");

            expect(wallet).toBeDefined();
            expect(wallet.isInitialized()).toBe(true);
            expect(wallet.address).toBe(ADDRESS);
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
            expect(wallet.curve).toBe(CURVE.SECP256K1);
        });
    });

    describe("Instance methods", () => {
        let wallet: Wallet;

        beforeEach(() => {
            wallet = Wallet.fromMnemonicSync(MNEMONIC, DEVIATION_PATH);
        });

        const signedMessage = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402"
        const message = "Hello, MOI";

        test("sign", () => {
            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];
            const signature = wallet.sign(Buffer.from(message), algo);

            expect(signature).toBe(signedMessage);
        });

        describe("verify", () => {
            test("should return true if the signature is valid", () => {
                const isVerified = wallet.verify(Buffer.from(message), signedMessage, wallet.publicKey);
                expect(isVerified).toBeTruthy();
            });

            test("should return false if the signature is invalid", () => {
                const invalidSignature = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2s70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726401";
                const isVerified = wallet.verify(Buffer.from("Hello, MOI!"), invalidSignature, wallet.publicKey);
                expect(isVerified).toBeFalsy();
            });
            
            test("should return false if the public key is invalid", () => {
                const isVerified = wallet.verify(Buffer.from(message), signedMessage, Buffer.from("invalid public key"));
                expect(isVerified).toBeFalsy();
            });

            test("should return false if the message is invalid", () => {
                const isVerified = wallet.verify(randomBytes(10), signedMessage, wallet.publicKey);
                expect(isVerified).toBeFalsy();
            });

            test("should return false if the public key is wrong", () => {
                const isVerified = wallet.verify(Buffer.from(message), signedMessage, Wallet.createRandomSync().publicKey);
                expect(isVerified).toBeFalsy();
            });
        });

        test("signInteraction", () => {
            const ixObject = {
                nonce: 0,
                sender: wallet.address,
                fuel_price: 1,
                fuel_limit: 200,
                ix_operations: [
                    {
                        type: OpType.ASSET_CREATE,
                        payload: {
                            standard: AssetStandard.MAS0,
                            symbol: "SIG",
                            supply: 1248577,
                        },
                    }
                ]
            };

            const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];
            const ixArgs = wallet.signInteraction(ixObject, algo);

            expect(ixArgs).toBeDefined();
            expect(ixArgs).toMatchObject<InteractionRequest>({
                ix_args: expect.any(String),
                signature: expect.any(String),
            });
            expect(ixArgs.ix_args).toEqual(
                "0ebf02068604830883089308ae08be088e0be00fe00f870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b000000000000000000000000000000000000000000000000000000000000000001c80f1f0e2f0316040e7f06336363616160534947130d411f0e3f068304870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b"
            );
        });

        test("address", () => {
            expect(wallet.address).toBe(ADDRESS);
        });

        test("isInitialized", () => {
            expect(wallet.isInitialized()).toBe(true);
        });

        test("mnemonic", () => {
            expect(wallet.mnemonic).toBe(MNEMONIC);
        });

        test("privateKey", () => {
            expect(wallet.privateKey).toBe(PRIVATE_KEY);
        });

        test("connect", () => {
            const provider = new VoyageProvider("babylon");

            wallet.connect(provider);

            expect(wallet.provider).toBe(provider);
        });

        test("generateKeystore", () => {
            const keystore = wallet.generateKeystore("password");

            expect(keystore).toBeDefined();
            expect(keystore).not.toBeNull();
        });
    });
});
