import { Wallet } from "js-moi-wallet";

import { LogicDriver, getLogicDriver } from "../src.ts/logic-driver";
import { LogicFactory } from "../src.ts/logic-factory";

import type { LogicManifest } from "js-moi-manifest";
import { loadManifestFromFile } from "js-moi-manifest/__tests__/utils/helper";
import { JsonRpcProvider, type InteractionReceipt, type InteractionResponse } from "js-moi-providers";
import { createRoutineOption } from "../src.ts/routine-options";

const HOST = "https://api-voyage.moibit.io/babylon";
const MNEMONIC = "chunk casual address metal napkin fortune noodle bottom muffin job antenna devote";
const INITIAL_SUPPLY = 100000000;
const SYMBOL = "MOI";
const RECEIVER = "0x4cdc9a1430ca00cbaaab5dcd858236ba75e64b863d69fa799d31854e103ddf72";
const PATH = "m/44'/6174'/0'/0/1";
const PROVIDER = new JsonRpcProvider(HOST);

let wallet: Wallet;

beforeAll(async () => {
    wallet = await Wallet.fromMnemonic(MNEMONIC, PATH);
    wallet.connect(PROVIDER);
});

it("should initialize the wallet", async () => {
    expect(wallet).toBeInstanceOf(Wallet);
    expect(wallet.getAddress()).toBeDefined();
});

describe("Logic", () => {
    let logicId: string | undefined;
    let manifest: LogicManifest.Manifest;

    let ix: InteractionResponse;
    let receipt: InteractionReceipt;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");

        const factory = new LogicFactory(manifest, wallet);
        ix = await factory.deploy("Seed", SYMBOL, INITIAL_SUPPLY);
        receipt = await ix.wait();
        logicId = await ix.result();
    });

    describe("deploy logic", () => {
        it("should deploy logic without options", async () => {
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should deploy logic with options", async () => {
            const factory = new LogicFactory(manifest, wallet);
            const symbol = "MOI";
            const supply = 100000000;
            const option = createRoutineOption({ fuelPrice: 1, fuelLimit: 3000 + Math.floor(Math.random() * 3000) });
            const ix = await factory.deploy("Seed", symbol, supply, option);

            const receipt = await ix.wait();
            logicId = await ix.result();

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });
    });

    describe("logic driver initialized using signer", () => {
        let logic: LogicDriver;

        beforeAll(async () => {
            if (logicId == null) {
                expect(logicId).toBeDefined();
            }

            logic = await getLogicDriver(logicId!, wallet);
        });

        it("should able to retrieve balance of the account", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());

            expect(balance).toBe(INITIAL_SUPPLY);
        });

        it("should able to transfer without option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const ix = await logic.routines.Transfer(amount, RECEIVER);
            const receipt = await ix.wait();

            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should able to transfer with option", async () => {
            const amount = Math.floor(Math.random() * 1000);
            const option = createRoutineOption({ fuelPrice: 1, fuelLimit: 2000 });
            const ix = await logic.routines.Transfer(amount, RECEIVER, option);
            const receipt = await ix.wait();
            const { balance } = await logic.routines.BalanceOf(RECEIVER);

            expect(balance).toBeGreaterThanOrEqual(amount);
            expect(ix.hash).toBeDefined();
            expect(receipt).toBeDefined();
        });

        it("should throw error when logic execution throw error using `result()`", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            const amount = balance + 1;
            const ix = await logic.routines.Transfer(amount, RECEIVER);

            try {
                await ix.result();
            } catch (error) {
                expect(error.message).toBe("sender has insufficient balance");
            }
        });

        it("should throw error when logic execution throw error using `wait()`", async () => {
            const { balance } = await logic.routines.BalanceOf(wallet.getAddress());
            const amount = balance + 1;
            const ix = await logic.routines.Transfer(amount, RECEIVER);

            try {
                await ix.wait();
            } catch (error) {
                expect(error.message).toBe("sender has insufficient balance");
                expect(error.params.receipt).toBeDefined();
            }
        });

        it("should be able to read from persistent storage", async () => {
            const symbol = await logic.persistentState.get((b) => b.entity("Symbol"));

            expect(symbol).toBe(SYMBOL);
        });

        it("should throw error when reading from persistent storage with invalid key", async () => {
            const invalidKey = "invalid-key";

            expect(async () => {
                await logic.persistentState.get((b) => b.entity(invalidKey));
            }).rejects.toThrow(`'${invalidKey}' is not member of persistent state`);
        });
    });

    let logic: LogicDriver;

    beforeAll(async () => {
        logic = new LogicDriver("0x", manifest, wallet);
    });

    it("should be able return routine is mutable or not", () => {
        const routine = [
            { name: "Transfer", mutable: true },
            { name: "BalanceOf", mutable: false },
        ];

        for (const { name, mutable } of routine) {
            if (name in logic.routines) {
                const isMutable = logic.routines[name].isMutable();
                expect(isMutable).toBe(mutable);
            }
        }
    });
});
