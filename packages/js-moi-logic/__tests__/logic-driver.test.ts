import { ManifestCoder } from "js-moi-manifest";
import { HttpProvider, InteractionResponse } from "js-moi-providers";
import { bytesToHex, ElementType, LogicState, OperationStatus, OpType, randomBytes, StorageKey, type IxResult } from "js-moi-utils";
import { getLogicDriver, LogicDriver, type CallsiteOption } from "../src.ts";
import { loadManifestFromFile } from "./manifests";

import { LogicId } from "js-moi-identifiers";
import { Wallet } from "../../js-moi-wallet/src.ts";
import { createWallet } from "./helpers";

const TEST_LOGIC_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

const runNetworkTest = process.env["RUN_NETWORK_TEST"] === "true";
const TEST_TIMEOUT = 2 * 60000; // 2 minutes

describe(getLogicDriver, () => {
    const wallet = Wallet.createRandomSync({ provider: new HttpProvider("http://localhost:1600") });
    const manifest = loadManifestFromFile("flipper");

    beforeAll(() => {
        jest.spyOn(wallet.getProvider(), "getLogic").mockReturnValue(ManifestCoder.encodeManifest(manifest) as any);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it("should setup driver from logic id", async () => {
        const driver = await getLogicDriver(new LogicId(TEST_LOGIC_ID), wallet);

        expect(driver).toBeInstanceOf(LogicDriver);
        expect((await driver.getLogicId()).toString()).toEqual(TEST_LOGIC_ID);
    });

    it("should setup logic driver from manifest", async () => {
        const driver = await getLogicDriver(manifest, wallet);

        expect(driver).toBeDefined();
        expect(driver).toBeInstanceOf(LogicDriver);
    });
});

const logics = [
    {
        name: "tokenledger",
        isEphemeral: false,
        isPersistent: true,
        deploy: {
            name: "Seed",
            args: ["MOI", 10_000],
        },
        readonly: {
            type: OpType.LogicInvoke,
            name: "BalanceOf",
            args: [bytesToHex(randomBytes(32))],
            expected: { balance: 0 },
        },
        invoke: {
            type: OpType.LogicInvoke,
            name: "Transfer",
            args: [10_000, bytesToHex(randomBytes(32))],
        },
        persistent: {
            accessor: (b) => b.name("Symbol"),
            expected: "MOI",
        },
    },
    {
        name: "lockledger",
        isEphemeral: true,
        isPersistent: true,
        deploy: {
            name: "Seed",
            args: ["MOI Foundation", "MOI", 10_000],
        },
        invoke: {
            type: OpType.LogicEnlist,
            name: "Register",
            args: [],
        },
        ephemeral: {
            accessor: (b) => b.name("Spendable"),
            expected: 10_000,
        },
    },
];

describe.each(logics)(`${LogicDriver.name} of logic $name`, (logic) => {
    const wallet = createWallet();
    const manifest = loadManifestFromFile(logic.name);
    const driver = new LogicDriver({ manifest, signer: wallet });

    describe("constructor", () => {
        it("should throw error if manifest is not provided", () => {
            expect(() => new LogicDriver({ manifest: null!, signer: wallet })).toThrow("Manifest is required.");
        });

        it("should throw error if signer is not provided", () => {
            expect(() => new LogicDriver({ manifest, signer: null! })).toThrow();
        });
    });

    describe(driver.getStorageKey, () => {
        it("should get storage key", async () => {
            const key = driver.getStorageKey(LogicState.Persistent, (b) => b.name("Symbol"));

            expect(key).toBeInstanceOf(StorageKey);
        });

        if (!logic.isEphemeral) {
            it("should throw error if state is not in logic", () => {
                const state = LogicState.Ephemeral;
                expect(() => driver.getStorageKey(state, (b) => b.name("Symbol"))).toThrow(`State "${state}" not found in logic.`);
            });
        }
    });

    describe(driver.isDeployed, () => {
        it("should return true if logic is deployed", async () => {
            const getLogicSpy = jest.spyOn(driver, "getLogicId").mockResolvedValue(new LogicId(TEST_LOGIC_ID));

            expect(await driver.isDeployed()).toBe(true);

            getLogicSpy.mockRestore();
        });

        it("should return false if logic is not deployed", async () => {
            expect(await driver.isDeployed()).toBe(false);
        });
    });

    describe(driver.getLogicId, () => {
        it("should throw error if logic is not deployed", async () => {
            await expect(driver.getLogicId()).rejects.toThrow("Logic id not found. This can happen if the logic is not deployed.");
        });

        it("should get logic id", async () => {
            const interaction: any = {
                hash: bytesToHex(randomBytes(32)),
                confirmation: {
                    operations: [
                        {
                            type: OpType.LogicDeploy,
                            status: OperationStatus.Ok,
                            data: {
                                error: "0x",
                                logic_id: TEST_LOGIC_ID,
                            },
                        } satisfies IxResult<OpType.LogicDeploy>,
                    ],
                },
            };

            const interactionResponseMock = jest.replaceProperty(driver, "deployIxResponse" as any, new InteractionResponse(interaction, wallet.getProvider()));
            const logicId = await driver.getLogicId();

            expect(logicId.toString()).toEqual(interaction.confirmation.operations[0].data.logic_id);

            // cleanup
            interactionResponseMock.restore();
            driver["logicId"] = undefined;
        });
    });

    describe("endpoints", () => {
        const routines = manifest.elements.filter((element) => element.kind === ElementType.Routine);

        it.each(routines)('should setup endpoint "$data.name"', async (routine) => {
            const callback = driver.endpoint[routine.data.name];

            expect(callback).toBeDefined();
            expect(callback).toBeInstanceOf(Function);
        });
    });

    it(`should throw error if invoking routine "${logic.invoke.name}" when logic is not deployed`, async () => {
        const callback = driver.endpoint[logic.invoke.name];

        await expect(() => callback(...(logic.invoke.args as any))).rejects.toThrow(/Logic is not deployed./);
    });

    describe("Network tests", () => {
        const it = runNetworkTest ? global.it : global.it.skip;
        let driver: LogicDriver;
        let logicId: LogicId;

        beforeAll(async () => {
            driver = await getLogicDriver(manifest, wallet);

            const sequenceId = process.env["WALLET_SEQUENCE_CURRENT"] ?? undefined;
            process.env["WALLET_SEQUENCE_CURRENT"] = process.env["WALLET_SEQUENCE_CURRENT"] ? (parseInt(process.env["WALLET_SEQUENCE_CURRENT"]) + 1).toString() : "1";

            const callback = driver.endpoint[logic.deploy.name];
            const option: CallsiteOption = {
                sender: { sequence_id: sequenceId ? parseInt(sequenceId) : undefined },
            };
            await callback<InteractionResponse>(...(logic.deploy.args as any[]), option);
            logicId = await driver.getLogicId();
        }, TEST_TIMEOUT);

        it(
            "should deploy a logic",
            async () => {
                const logic = await wallet.getProvider().getLogic(logicId);

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id).toEqual(logicId.toString());
            },
            TEST_TIMEOUT
        );

        it(
            "should throw error if logic if already deployed",
            async () => {
                expect(driver.endpoint[logic.deploy.name](...(logic.deploy.args as any))).rejects.toThrow(/Logic is already deployed or deploying./);
            },
            TEST_TIMEOUT
        );

        describe(`should be able to invoke routine ${logic.invoke.name} of type ${OpType[logic.invoke.type]}`, () => {
            it(
                "when options are not provided",
                async () => {
                    const callback = driver.endpoint[logic.invoke.name];
                    const ix = await callback<InteractionResponse>(...(logic.invoke.args as any));

                    expect(ix.hash).toBeDefined();
                    const results = await ix.result();
                    expect(results).toHaveLength(1);
                    expect(results?.[0].type);
                },
                TEST_TIMEOUT
            );

            it(
                "when options are provided",
                async () => {
                    const callback = driver.endpoint[logic.invoke.name];
                    const ix = await callback<InteractionResponse>(...(logic.invoke.args as any), {
                        fuel_price: 1,
                        fuel_limit: 10000,
                    });

                    expect(ix.hash).toBeDefined();
                    const results = await ix.result();
                    expect(results).toHaveLength(1);
                    expect(results?.[0].type);
                },
                TEST_TIMEOUT
            );
        });

        if (logic.readonly) {
            describe(`should be able to invoke routine ${logic.readonly.name} of type ${OpType[logic.readonly.type]}`, () => {
                it("when options are not provided", async () => {
                    const callback = driver.endpoint[logic.readonly.name];
                    const value = await callback(...(logic.readonly.args as any));

                    expect(value).toStrictEqual(logic.readonly.expected);
                });

                it("when options are provided", async () => {
                    const callback = driver.endpoint[logic.readonly.name];
                    const value = await callback(...(logic.readonly.args as any), {
                        fuel_price: 1,
                        fuel_limit: 10000,
                    });

                    expect(value).toStrictEqual(logic.readonly.expected);
                });
            });
        }

        describe("should be able to access storage", () => {
            if (logic.persistent) {
                it("should be able to retrieve from persistent storage", async () => {
                    const value = await driver.persistent(logic.persistent.accessor);

                    expect(value).toEqual(logic.persistent.expected);
                });
            }

            if (logic.ephemeral) {
                it("should be able to retrieve from ephemeral storage", async () => {
                    const value = await driver.ephemeral(logic.ephemeral.accessor);

                    expect(value).toEqual(logic.ephemeral.expected);
                });
            }
        });
    });
});
