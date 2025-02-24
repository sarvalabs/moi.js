import { bytesToHex } from "js-moi-utils";
import { entropyToMnemonic, generateMnemonic, getDefaultWordlist, mnemonicToEntropy, mnemonicToSeed, mnemonicToSeedSync, validateMnemonic } from "../src.ts/bip39";

describe("Mnemonic Utils", () => {
    const mnemonic = "hollow appear story text start mask salt social child space aspect hurdle";
    const seed = "0x24faa968adf3d661eaaf49dc60f8b876125239411deb7bcca777ae7b320d534bf0e6bfea536a4b88db3521f2eeb5b07c7107e5e778df3c36c61c1668861208b1";
    const password = "password";

    describe("mnemonicToSeedSync", () => {
        it.concurrent("should convert mnemonic to seed synchronously", () => {
            expect(bytesToHex(mnemonicToSeedSync(mnemonic, password))).toBe(seed);
        });
    });

    describe("mnemonicToSeed", () => {
        it("should convert mnemonic to seed asynchronously", async () => {
            expect(bytesToHex(await mnemonicToSeed(mnemonic, password))).toBe(seed);
        });
    });

    describe("mnemonicToEntropy", () => {
        it("should convert mnemonic to entropy", () => {
            const entropy = mnemonicToEntropy(mnemonic);
            expect(entropy.length).toBeGreaterThan(0);
            expect(entropy).toBe("6ce1535a6fdd4b10efae6f27fa0835b7");
        });

        it("should throw an error for invalid mnemonic", () => {
            const mnemonic = "invalid mnemonic";
            expect(() => mnemonicToEntropy(mnemonic)).toThrow("Invalid mnemonic");
        });
    });

    describe("entropyToMnemonic", () => {
        it("should convert entropy to mnemonic", () => {
            const entropy = "c1f651a1fb62bebf8db1ecacf66a6a3d";
            const mnemonic = entropyToMnemonic(entropy);
            expect(mnemonic.length).toBeGreaterThan(0);
            expect(mnemonic).toBe("sea raw half walnut cloud garlic cycle diesel provide rebuild once key");
        });

        it("should throw an error for invalid entropy", () => {
            const entropy = "invalid entropy";
            expect(() => entropyToMnemonic(entropy)).toThrow("Invalid entropy");
        });
    });

    describe("generateMnemonic", () => {
        it("should generate a mnemonic phrase", () => {
            const mnemonic = generateMnemonic();
            expect(mnemonic.length).toBeGreaterThan(12);
        });

        it("should generate a mnemonic phrase with specified strength", () => {
            const strength = 256;
            const mnemonic = generateMnemonic(strength);
            expect(mnemonic.length).toBeGreaterThan(0);
        });

        it("should throw an error for invalid strength", () => {
            const strength = 123;
            expect(() => generateMnemonic(strength)).toThrowError("Invalid entropy");
        });
    });

    describe("validateMnemonic", () => {
        it("should return true for a valid mnemonic", () => {
            const mnemonic = "hollow appear story text start mask salt social child space aspect hurdle";
            const isValid = validateMnemonic(mnemonic);
            expect(isValid).toBe(true);
        });

        it("should return false for an invalid mnemonic", () => {
            const mnemonic = "invalid mnemonic";
            const isValid = validateMnemonic(mnemonic);
            expect(isValid).toBe(false);
        });
    });

    describe("getDefaultWordlist", () => {
        it("should return the default wordlist", () => {
            const language = getDefaultWordlist();
            expect(language).toBe("english");
        });
    });
});
