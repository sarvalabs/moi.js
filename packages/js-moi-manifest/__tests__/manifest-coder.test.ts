import type { LogicManifest } from "js-moi-utils";
import { ManifestCoder, ManifestCoderFormat } from "../src.ts";
import { loadFile, loadManifestFromFile } from "./utils/helper";

describe(ManifestCoder, () => {
    let manifest: LogicManifest;
    let manifestCoder: ManifestCoder;

    beforeAll(async () => {
        manifest = (await loadManifestFromFile("../../manifests/tokenledger.json")) as LogicManifest;
        manifestCoder = new ManifestCoder(manifest);
    });

    test("Encode manifest into polo format", async () => {
        const testcases = [
            {
                manifest: "../../manifests/tokenledger.json",
                expected: "../../manifests/tokenledger.polo",
            },
            {
                manifest: "../../manifests/flipper.json",
                expected: "../../manifests/flipper.polo",
            },
            {
                manifest: "../../manifests/guardian.json",
                expected: "../../manifests/guardian.polo",
            },
            {
                manifest: "../../manifests/lock-ledger.json",
                expected: "../../manifests/lock-ledger.polo",
            },
        ];

        await Promise.all(
            testcases.map(async (testCase) => {
                const [manifest, expected] = await Promise.all([loadManifestFromFile(testCase.manifest), loadFile(testCase.expected)]);
                const polo = ManifestCoder.encodeManifest(manifest);

                expect(polo).toBe(expected);
            })
        );
    });

    describe("Encode arguments into polo format", () => {
        test("When the field is passed as a routine name", () => {
            const calldata = manifestCoder.encodeArguments("Seed", "MOI", 100_000_000);

            expect(calldata).toBe("0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49");
        });
    });

    describe("Decode polo encoded arguments", () => {
        test("When the field is passed as a routine name", () => {
            const calldata = "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49";
            const args = ["MOI", 100_000_000];
            const decoded = manifestCoder.decodeArguments<[symbol: string, supply: number]>("Seed", calldata);

            if (decoded) {
                for (let i = 0; i < args.length; i++) {
                    expect(decoded[i]).toEqual(args[i]);
                }
            }
        });
    });

    describe("Decode polo encoded arguments", () => {
        const calldata = "0x0e1f0305f5e100";
        const callsite = "BalanceOf";

        test("When the field is passed as a routine name", () => {
            const args = manifestCoder.decodeOutput<{ balance: number }>(callsite, calldata);

            expect(args).toEqual({ balance: expect.any(Number) });
        });
    });

    test("Decode polo encoded exception", () => {
        const error =
            "0x0e6f0666d104de04737472696e67696e73756666696369656e742062616c616e636520666f722073656e6465723f06e60172756e74696d652e726f6f742829726f7574696e652e5472616e736665722829205b3078635d202e2e2e205b307831623a205448524f57203078355d";
        const exception = ManifestCoder.decodeException(error);

        expect(exception).toBeDefined();
        expect(exception).toEqual({
            class: "string",
            error: "insufficient balance for sender",
            revert: false,
            trace: ["runtime.root()", "routine.Transfer() [0xc] ... [0x1b: THROW 0x5]"],
        });
    });

    test("Decode polo encoded event log", () => {
        const testTable = [
            {
                event: "builtin.Log",
                log: "0x0d2f065576616c756506736565646564206239306633396663663334366261333236303531383636393439356635643336386138643162623830323335383466363765386135363731636633633536636520776974682031303030303030302044554d4d",
                expected: {
                    value: expect.any(String),
                },
            },
            {
                event: "Transfer",
                log: "0x0daf010665860185029606f506616d6f756e740364726563656976657206190f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce73656e64657206b90f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56ce",
                expected: {
                    amount: expect.any(Number),
                    receiver: expect.any(Uint8Array),
                    sender: expect.any(Uint8Array),
                },
            },
        ];

        for (const test of testTable) {
            const decoded = manifestCoder.decodeEventOutput(test.event, test.log);
            expect(decoded).not.toBeNull();
            expect(decoded).toEqual(test.expected);
        }
    });

    test("Decode polo-encoded manifest", async () => {
        const testCases = [
            {
                manifest: "../../manifests/tokenledger.polo",
                expected: "../../manifests/tokenledger.json",
            },
            {
                manifest: "../../manifests/flipper.polo",
                expected: "../../manifests/flipper.json",
            },
            {
                manifest: "../../manifests/guardian.polo",
                expected: "../../manifests/guardian.json",
            },
            {
                manifest: "../../manifests/lock-ledger.polo",
                expected: "../../manifests/lock-ledger.json",
            },
        ];

        await Promise.all(
            testCases.map(async (testCase) => {
                const [polo, expected] = await Promise.all([loadFile(testCase.manifest), loadManifestFromFile(testCase.expected)]);

                const manifest = ManifestCoder.decodeManifest(polo, ManifestCoderFormat.JSON);
                expect(manifest).toEqual(expected);
            })
        );
    });

    test("Encoding JSON into YAML", async () => {
        const testCases = [
            {
                manifest: "../../manifests/tokenledger.polo",
                expected: "../../manifests/tokenledger.json",
            },
            {
                manifest: "../../manifests/flipper.polo",
                expected: "../../manifests/flipper.json",
            },
            {
                manifest: "../../manifests/guardian.polo",
                expected: "../../manifests/guardian.json",
            },
            {
                manifest: "../../manifests/lock-ledger.polo",
                expected: "../../manifests/lock-ledger.json",
            },
        ];

        await Promise.all(
            testCases.map(async (testCase) => {
                const polo = await loadFile(testCase.manifest);
                const yaml = ManifestCoder.decodeManifest(polo, ManifestCoderFormat.YAML);

                expect(ManifestCoder.encodeManifest(yaml)).toBe(polo);
                expect(ManifestCoder.decodeManifest(polo, ManifestCoderFormat.YAML)).toEqual(yaml);
            })
        );
    });
});
