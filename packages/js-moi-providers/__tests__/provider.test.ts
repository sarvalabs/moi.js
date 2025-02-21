import { AssetId, createParticipantId, IdentifierVersion, LogicId } from "js-moi-identifiers";
import {
    ArrayIndexAccessor,
    AssetStandard,
    ensureHexPrefix,
    generateStorageKey,
    interaction,
    isHex,
    OpType,
    randomBytes,
    ReceiptStatus,
    trimHexPrefix,
    type Hex,
    type JsonRpcResponse,
} from "js-moi-utils";
import { HttpProvider, HttpTransport, JsonRpcProvider, WebsocketTransport, type LogicMessageRequestOption } from "../src.ts";

describe(JsonRpcProvider, () => {
    const providerType = process.env["PROVIDER_TYPE"]!;
    const providerUrl = process.env["PROVIDER_URL"]!;

    const provider: JsonRpcProvider = (() => {
        if (!providerType) {
            return new HttpProvider("http://localhost:1600");
        }

        if (!providerUrl) {
            throw new Error("PROVIDER_URL is not set");
        }

        switch (providerType) {
            case "http":
                return new JsonRpcProvider(new HttpTransport(providerUrl));
            case "websocket":
                return new JsonRpcProvider(new WebsocketTransport(providerUrl));
            default:
                throw new Error(`Unknown provider type: ${providerType}`);
        }
    })();

    describe("constructor", () => {
        it.concurrent("should create instance of JsonRpcProvider", () => {
            expect(new JsonRpcProvider(new HttpTransport("http://localhost:1600"))).toBeInstanceOf(JsonRpcProvider);
        });

        it.concurrent("should throw error if transport is not provided", () => {
            expect(() => new JsonRpcProvider(null!)).toThrow();
        });
    });

    describe("get transport", () => {
        it.concurrent("should return the transport instance", () => {
            expect("request" in provider.transport).toBeTruthy();
            expect(provider.transport.request).toBeInstanceOf(Function);
        });
    });

    describe(provider.processJsonRpcResponse, () => {
        it.concurrent("should return the result when response is successful", () => {
            const response: JsonRpcResponse<unknown> = {
                id: 1,
                jsonrpc: "2.0",
                result: "success",
            };

            const result = provider.processJsonRpcResponse(response);

            expect(result).toBe(response.result);
        });

        it.concurrent("should throw error with correct error code when response is failed", () => {
            const response: JsonRpcResponse<unknown> = {
                id: 1,
                jsonrpc: "2.0",
                error: {
                    code: 400,
                    message: "Bad request",
                    data: null,
                },
            };

            try {
                provider.processJsonRpcResponse(response);
            } catch (error: any) {
                expect(error instanceof Error).toBeTruthy();
                expect(error?.message).toBe(response.error.message);
                expect(error?.code).toBe(response.error.code);
            }
        });
    });

    describe("Network related tests", () => {
        const it = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it : globalThis.it.skip;
        it.concurrent = process.env["RUN_NETWORK_TEST"] === "true" ? globalThis.it.concurrent : globalThis.it.concurrent.skip;

        const FALLBACK_LOGIC_ID: Hex = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";
        const FALLBACK_ASSET_ID: Hex = "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000";

        const participant = ensureHexPrefix(
            process.env["WALLET_ADDRESS"] ??
                createParticipantId({
                    fingerprint: randomBytes(24),
                    variant: 0,
                    version: IdentifierVersion.V0,
                }).toHex()
        );
        const logic_id = ensureHexPrefix(process.env["LOGIC_ID"] ?? FALLBACK_LOGIC_ID);
        const asset_id = ensureHexPrefix(process.env["ASSET_ID"] ?? FALLBACK_ASSET_ID);

        describe(provider.getNetworkInfo, () => {
            it.concurrent("should return the protocol version and chain id", async () => {
                const protocol = await provider.getNetworkInfo();

                expect(protocol).toEqual({ chain_id: expect.any(Number), version: expect.any(String) });
            });
        });

        describe(provider.simulate, () => {
            it.concurrent("should return the simulation result when raw interaction object is passed", async () => {
                const result = await provider.simulate({
                    sender: { id: participant, key_id: 0, sequence_id: 0 },
                    fuel_price: 1,
                    operations: [
                        {
                            type: OpType.AssetCreate,
                            payload: { symbol: "TST", standard: AssetStandard.MAS0, supply: 1000000 },
                        },
                    ],
                });

                expect(result).toBeDefined();
                expect(result.status).toBe(ReceiptStatus.Ok);
                expect(result.hash).toEqual(expect.any(String));
            });

            it.concurrent("should return the simulation result when POLO encoded interaction is passed", async () => {
                const args = interaction({
                    sender: { id: participant, key_id: 0, sequence_id: 0 },
                    fuel_price: 1,
                    fuel_limit: 1000,
                    operations: [
                        {
                            type: OpType.AssetCreate,
                            payload: { symbol: "TST", standard: AssetStandard.MAS0, supply: 1000000 },
                        },
                    ],
                });

                const result = await provider.simulate(args);

                expect(result).toBeDefined();
                expect(result.status).toBe(ReceiptStatus.Ok);
                expect(result.hash).toEqual(expect.any(String));
            });
        });

        describe(provider.getAccount, () => {
            it.concurrent("should return the account when retrieved using address", async () => {
                const account = await provider.getAccount(participant);

                expect(account).toBeDefined();
                expect(account.metadata.address).toEqual(participant);
            });

            it.concurrent("should able to get account using reference", async () => {
                const height = 0;
                const account = await provider.getAccount(participant, {
                    reference: { relative: { height, id: participant } },
                    modifier: { include: ["state", "keys", "balances", "mandates", "lockups", "guardians", "enlisted"] },
                });

                expect(account).toBeDefined();
                expect(account.metadata.height).toBe(height);
                expect(account.state).toBeDefined();
                expect(account.balances).toBeDefined();
                expect(account.enlisted).toBeDefined();
                expect(account.guardians).toBeDefined();
                expect(account.keys).toBeDefined();
                expect(account.lockups).toBeDefined();
            });

            it.concurrent("should return the account with included fields", async () => {
                const account = await provider.getAccount(participant, { modifier: { include: ["balances"] } });

                expect(account).toBeDefined();
                expect(account.balances).toBeDefined();
            });

            it.concurrent("should return the object with the extracted fields", async () => {
                const balances = await provider.getAccount(participant, { modifier: { extract: "balances" } });

                expect(balances).toBeDefined();
                expect(Array.isArray(balances)).toBeTruthy();
            });
        });

        describe(provider.getTesseract, () => {
            it.concurrent("should return the tesseract when retrieved using address and height", async () => {
                const height = 0;
                const tesseract = await provider.getTesseract(participant, height, {
                    modifier: { include: ["confirmations", "consensus", "interactions"] },
                });

                expect(tesseract).toBeDefined();
                expect(tesseract.hash).toBeDefined();
                expect(tesseract.tesseract).toBeDefined();
            });

            it.concurrent("should return the tesseract when retrieved using tesseract hash", async () => {
                const height = 0;
                const currentTesseract = await provider.getTesseract(participant, height);
                const tesseract = await provider.getTesseract(currentTesseract.hash);

                expect(tesseract).toBeDefined();
                expect(tesseract.hash).toBeDefined();
                expect(tesseract.hash).toBe(currentTesseract.hash);
            });

            it.concurrent("should return the tesseract when retrieved using tesseract reference", async () => {
                const height = 0;
                const currentTesseract = await provider.getTesseract(participant, height);
                const tesseract = await provider.getTesseract({ relative: { height, id: participant } });

                expect(tesseract).toBeDefined();
                expect(tesseract.hash).toBeDefined();
                expect(tesseract.hash).toBe(currentTesseract.hash);
            });

            it.concurrent("should return the tesseract with included fields", async () => {
                const tesseract = await provider.getTesseract(participant, 0, {
                    modifier: { include: ["confirmations", "consensus", "interactions"] },
                });

                expect(tesseract).toBeDefined();
                expect(tesseract.interactions).toBeDefined();
                expect(tesseract.confirmations).toBeDefined();
                expect(tesseract.consensus).toBeDefined();
                expect(tesseract.interactions).toBeDefined();
            });
        });

        describe(provider.getLogic, () => {
            it.concurrent("should return the logic when retrieved using identifier", async () => {
                const logic = await provider.getLogic(new LogicId(logic_id));

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(logic_id))).toBeTruthy();
            });

            it.concurrent("should return the logic when retrieved using address", async () => {
                const logic = await provider.getLogic(logic_id);

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(logic_id))).toBeTruthy();
            });

            it.concurrent("should return the logic with reference", async () => {
                const logic = await provider.getLogic(new LogicId(logic_id), {
                    reference: { relative: { id: new LogicId(logic_id).toHex(), height: 0 } },
                });

                expect(logic).toBeDefined();
                expect(logic.metadata.logic_id.includes(trimHexPrefix(logic_id))).toBeTruthy();
            });

            it.concurrent("should return the logic with included fields", async () => {
                const logic = await provider.getLogic(new LogicId(logic_id), {
                    modifier: { include: ["manifest", "controller", "edition"] },
                });

                expect(logic).toBeDefined();
                expect(logic.manifest).toBeDefined();
                // FIXME: Protocol erroring out with `controller` and `edition` fields not found.
                expect(logic.controller).toBeDefined();
                expect(logic.edition).toBeDefined();
            });

            it.concurrent("should return the logic with extracted fields", async () => {
                const manifest = await provider.getLogic(new LogicId(logic_id), {
                    modifier: { extract: "manifest" },
                });

                expect(manifest).toBeDefined();
                expect(isHex(manifest)).toBeDefined();
            });
        });

        describe(provider.getLogicStorage, () => {
            it.concurrent("should return the logic storage when retrieved using logic id and storage id", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const value = await provider.getLogicStorage(logic_id, storageId);

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });

            it.concurrent("should return the logic storage when retrieved using logic id and storage id", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const value = await provider.getLogicStorage(new LogicId(logic_id), storageId.hex());

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });

            it.concurrent("should return the logic storage using reference", async () => {
                const storageId = generateStorageKey(1, new ArrayIndexAccessor(0));
                const logicId = new LogicId(logic_id);
                const value = await provider.getLogicStorage(logic_id, storageId, {
                    reference: { relative: { id: logicId.toHex(), height: 0 } },
                });

                expect(value).toBeDefined();
                expect(isHex(value)).toBeTruthy();
            });
        });

        describe(provider.getAsset, () => {
            const assetId = new AssetId(asset_id);

            it.concurrent("should return the asset when retrieved using asset address", async () => {
                const asset = await provider.getAsset(assetId);

                expect(asset).toBeDefined();
                expect(asset.metadata.latest_id).toBe(assetId.toHex());
                expect(asset.metadata.standard).toBe(assetId.getStandard());
            });

            it.concurrent("should return the asset when retrieved using asset id", async () => {
                const asset = await provider.getAsset(assetId);

                expect(asset).toBeDefined();
                expect(asset.metadata.latest_id).toBe(assetId.toHex());
                expect(asset.metadata.logical).toBe(false);
            });

            it.concurrent("[ERROR::Reason::In metadata 'asset_id' is 'latest_id'] should return the asset with reference", async () => {
                const asset = await provider.getAsset(assetId, {
                    reference: { relative: { id: assetId.toHex(), height: -1 } },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata.latest_id).toBe(assetId.toHex());
                expect(typeof asset.metadata.supply).toBe("string");
            });

            it.concurrent("should return the asset with included fields", async () => {
                const asset = await provider.getAsset(assetId, {
                    modifier: { include: ["controller", "creator", "edition"] },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata).toBeDefined();
                expect(asset.controller).toBeDefined();
                expect(asset.edition).toBeDefined();
            });

            it.concurrent("should return the asset with extracted fields", async () => {
                const controller = await provider.getAsset(assetId, {
                    modifier: { extract: "controller" },
                });

                expect(controller).toBeDefined();
            });

            it.concurrent("[ERROR::Reason::Getting invalid fields for 'creator' and 'edition'] should return the asset with modifier and reference", async () => {
                const asset = await provider.getAsset(assetId, {
                    modifier: { include: ["controller", "creator", "edition"] },
                    reference: { relative: { id: assetId.toHex(), height: -1 } },
                });

                expect(asset).toBeDefined();
                expect(asset.metadata).toBeDefined();
                expect(asset.controller).toBeDefined();
                expect(asset.edition).toBeDefined();
            });
        });

        describe(provider.getLogicMessage, () => {
            it.concurrent("should return the logic message when retrieved using logic id", async () => {
                const messages = await provider.getLogicMessage(new LogicId(logic_id));

                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                for (const message of messages) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(logic_id);
                }
            });

            it.concurrent("should return the logic message when address is passed", async () => {
                const messages = await provider.getLogicMessage(new LogicId(logic_id), {
                    id: new LogicId(logic_id).toHex(),
                });

                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                for (const message of messages) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(logic_id);
                }
            });

            it.concurrent.each<LogicMessageRequestOption & { case: string }>([
                {
                    case: "when address is passed",
                    id: participant,
                },
                {
                    case: "when range is passed",
                    range: { start: 0, stop: 10 },
                },
                {
                    case: "when invalid topics are passed",
                    topics: ["0x01", "0x02"],
                },
                {
                    case: "when topics are passed",
                    topics: ["0x5edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a"],
                },
                {
                    case: "when all options are passed",
                    id: "0x5fc0247c18448e91d15542ffb7a0956b6d5f1a19bdd11a36e6a1f7369288f886",
                    topics: ["0x5edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f780d88233a4e57b10a"],
                    range: { start: 0, stop: 9 },
                },
            ])("should return the logic message $case", async ({ case: name, ...option }) => {
                const messages = await provider.getLogicMessage(logic_id, option);
                expect(messages).toBeDefined();
                expect(Array.isArray(messages)).toBeTruthy();

                for (const message of messages) {
                    expect(message.event).toBeDefined();
                    expect(message.source).toBeDefined();
                    expect(message.event.logic_id).toBe(logic_id);
                }
            });
        });

        describe(provider.getAccountAsset, () => {
            it.concurrent("should return the account asset when retrieved using address and asset id", async () => {
                const accountAsset = await provider.getAccountAsset(participant, asset_id);

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
            });

            it.concurrent("should return the account asset with reference", async () => {
                const accountAsset = await provider.getAccountAsset(participant, asset_id, {
                    reference: { relative: { id: participant, height: 0 } },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
            });

            it.concurrent("should return the account asset with included fields", async () => {
                const accountAsset = await provider.getAccountAsset(participant, asset_id, {
                    modifier: { include: ["lockup", "mandate"] },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
                expect(accountAsset.lockup).toBeDefined();
                expect(accountAsset.mandate).toBeDefined();
            });

            it.concurrent("should return the account asset with extracted fields", async () => {
                const lockup = await provider.getAccountAsset(participant, asset_id, {
                    modifier: { extract: "lockup" },
                });

                expect(lockup).toBeDefined();
            });

            it.concurrent("should return the account asset with modifier and reference", async () => {
                const accountAsset = await provider.getAccountAsset(participant, asset_id, {
                    modifier: { include: ["lockup", "mandate"] },
                    reference: { relative: { id: participant, height: 0 } },
                });

                expect(accountAsset).toBeDefined();
                expect(isHex(accountAsset.balance)).toBeTruthy();
                expect(accountAsset.lockup).toBeDefined();
                expect(accountAsset.mandate).toBeDefined();
            });
        });

        describe(provider.getAccountKey, () => {
            it.concurrent("should return the account key when retrieved using address and key index", async () => {
                const accountKey = await provider.getAccountKey(participant, 0);

                expect(accountKey).toBeDefined();
                expect(accountKey.key_id).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
            });

            it.concurrent("should return the account key with reference", async () => {
                const accountKey = await provider.getAccountKey(participant, 0, {
                    reference: { relative: { id: participant, height: 0 } },
                });

                expect(accountKey).toBeDefined();
                expect(accountKey.key_id).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
            });

            it.concurrent("should return the account key with pending true", async () => {
                const accountKey = await provider.getAccountKey(participant, 0);

                expect(accountKey).toBeDefined();
                expect(accountKey.key_id).toBe(0);
                expect(accountKey.public_key).toBeDefined();
                expect(accountKey.weight).toBeDefined();
                expect(accountKey.revoked).toBeDefined();
                expect(accountKey.sequence).toBeDefined();
            });
        });
    });
});
