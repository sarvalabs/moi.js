import assert from "assert";

import { OpType } from "js-moi-utils";
import { Wallet } from "js-moi-wallet";
import { WebSocketEvent } from "../src.ts/websocket-events";
import { WebsocketProvider } from "../src.ts/websocket-provider";
import { getRandomSupply, initializeWallet } from "./utils/utils";

const HOST = "<YOUR WEBSOCKET HOST>";
const MNEMONIC = "<YOUR MNEMONIC>";
const ASSET_ID = "<YOUR ASSET ID>";

describe("Test Websocket Provider", () => {
    const isValidMnemonic = MNEMONIC.split(" ").length === 12;
    const isValidHost = HOST.startsWith("ws://") || HOST.startsWith("wss://");
    
    assert(isValidMnemonic, "Mnemonic is not valid");
    assert(isValidHost, "Host is not valid");
    assert(ASSET_ID.startsWith("0x"), "Asset ID is not valid");
    
    const provider = new WebsocketProvider(HOST);
    const wallet = initializeWallet(provider, MNEMONIC);

    describe("It should be able to perform rpc calls", () => {
        it("should be able to get TDUs", async () => {
            const tdu = await provider.getTDU(wallet.getAddress());

            expect(tdu).toBeDefined();
            expect(Array.isArray(tdu)).toBeTruthy();
        });

        it("should be able to get account info", async () => {
            const account = await provider.getAccountMetaInfo(
                wallet.getAddress()
            );

            expect(account).toBeDefined();
            expect(account.address).toBe(wallet.getAddress());
        });
    });

    describe("It should be able to listen to events", () => {
        const receiver = Wallet.createRandomSync().address;

        beforeAll(async () => {
            await wallet.sendInteraction({
                fuel_price: 1,
                fuel_limit: 100,
                ix_operations: [
                    {
                        type: OpType.ASSET_TRANSFER,
                        payload: {
                            beneficiary: receiver,
                            asset_id: ASSET_ID,
                            amount: getRandomSupply()
                        }
                    }
                ]
            });
        });

        test("should emit a event when connection is established", async () => {
            provider.on(WebSocketEvent.Connect, () => {
                // @ts-ignore
                expect(provider.ws).toBeDefined();
                // @ts-ignore
                expect(provider.ws.readyState).toBe(provider.ws.OPEN);
            });
        });

        test("should be able to listen to new pending interactions events", async () => {
            provider.on(WebSocketEvent.NewPendingInteractions, (ixHash) => {
                expect(ixHash).toBeDefined();
                expect(typeof ixHash).toBe("string");
                expect(ixHash.startsWith("0x")).toBeTruthy();
            });
        }, 10000);

        test("should be able to listen to new tesseract", async () => {
            provider.on(WebSocketEvent.NewTesseracts, (tesseract) => {
                expect(tesseract).toBeDefined();
                expect(tesseract.hash).toBeDefined();
                expect(tesseract.hash.startsWith("0x")).toBeTruthy();
                expect(Array.isArray(tesseract.ixns)).toBeTruthy();
            });
        });

        test("should be able to listen to tesseract of specific address", async () => {
            provider.on(
                {
                    event: WebSocketEvent.NewTesseractsByAccount,
                    params: { address: receiver },
                },
                (tesseract) => {
                    const isReceiverParticipating = tesseract.participants.some(
                        (p) => p.address === receiver
                    );
                    expect(isReceiverParticipating).toBeTruthy();
                }
            );
        });

        describe("It should be able to listen to new logs", () => {
            beforeAll(async () => {
                const ix = await wallet.sendInteraction({
                    fuel_price: 1,
                    fuel_limit: 10000,
                    ix_operations: [
                        {
                            type: OpType.LOGIC_DEPLOY,
                            payload: {
                                manifest: "0x0e4f031e9e01012f064e504953410fff040e9e059e0afe0dae118e1aae25ce31ce3fae4d8e51de5b9e67de7fee8a019e9d019ec101aed5015f0300068e01636f6e7374616e742f0666737472696e673078303637333635363536343635363432305f0310169e0101636f6e7374616e742f0666737472696e67307830363230373736393734363832305f0310169e0102636f6e7374616e742f0666737472696e673078303632305f0310169e0103636f6e7374616e742f06367536343078303331325f0310169e0104636f6e7374616e742f0666737472696e67307830363733363536653634363537323230363836313733323036653666323036323631366336313665363336355f0310169e0105636f6e7374616e742f0666737472696e673078303637333635366536343635373232303638363137333230363936653733373536363636363936333639363536653734323036323631366336313665363336355f0310169e0106636f6e7374616e742f0666737472696e6730783036363936653736363136633639363432303632373537323665323036313664366637353665373433613230363537383633363536353634373332303733373537303730366337395f0310169e0107636f6e7374616e742f0666737472696e67307830363639366537363631366336393634323036323735373236653230363136643666373536653734336132303733363536653634363537323230363836313733323036653666323036323631366336313665363336355f0310169e0108636f6e7374616e742f0666737472696e6730783036363936653736363136633639363432303632373537323665323036313664366637353665373433613230363936653733373536363636363936333639363536653734323036323631366336313665363336355f031016860109747970656465666d61705b616464726573735d753235364f0310166e0a6576656e745f0683019e015472616e73666572025f0e9e02ee043f03066673656e646572616464726573734f03169601017265636569766572616464726573733f03167602616d6f756e74753235364f0310166e0b73746174653f06ae0170657273697374656e745f0e8e02fe033f03066653796d626f6c737472696e673f03167601537570706c79753235364f031696010242616c616e6365736d61705b616464726573735d753235366f031e96018e020c4f0303132301020b726f7574696e65cf010646e601ce02fe068e07ee135365656470657273697374656e746465706c6f793f0e8e023f03066673796d626f6c737472696e673f03167601737570706c79753235360f5f06860c800c8000000401003600018100800001040201360002810080000273034903035700030281001100001000007303490303480303430000031103011003034300000348020243000002110202100202430000024300000142000072014901010600010f5f031e46be010d1f0303726f7574696e65df010686018602ee02fe029e058e07446563696d616c73726561646f6e6c79696e766f6b650f1f0e4f03068601646563696d616c737536345f06960190011100031000000500000f5f031e46be010e1f030b726f7574696e65df010696019602fe028e059e07ae0e42616c616e63654f66726561646f6e6c79696e766f6b651f0e3f03064661646472616464726573731f0e3f03067662616c616e6365753235365f06b606b0068000020401005402000162020211030903030262020211030b02030162020201620202110311030302560100010501000182000f6f031ea6019e020f4f0313233304050a0b726f7574696e65df01068601a6028e03fe078e088e1f5472616e7366657270657273697374656e74696e766f6b653f0eee013f030666616d6f756e74753235364f03169601017265636569766572616464726573730f5f06a616a01673004900008001025402010062020211030a03030262020211030c02030162020201110312030302110204100202070201560201000403004404020362040411051c030504110405100404070401040401540501046205051106250306056205051106270206016205050111062c0306052b05075701040501660202035701000256020104650202035701040281010a0153010000040001530101000400005301020011000a2e00000172014901010600010f5f031e46be01101f030b726f7574696e65cf010646e601ce02ce04de049e104d696e7470657273697374656e74696e766f6b651f0e3f030666616d6f756e74753235360f5f06e60ae00a800001370100040200650201022401023600018100800002730149010154020001620202110311030302620202110313020301620202011103180303022b0207570001020156020001040300650202035700010281000f6f031ea6019e02114f031323330607080b726f7574696e65cf010646e601ce02ce04de04ae164275726e70657273697374656e74696e766f6b651f0e3f030666616d6f756e74753235360f5f06f610f0108000013701000402004403010262030311040a03040311030610030307030166020102240102360001810080000273014901015402000162020211031903030262020211031b02030162020201110321030302110207100202070201560200010403004402020362020211042b03040211020810020207020156020001660202035700010281000f",
                                callsite: "Seed",
                                calldata: "0x0d6f0665a6018502737570706c790398968073796d626f6c0644554d4d",
                            }
                        }
                    ],
                });

                const result = await ix.result();

                await wallet.sendInteraction({
                    fuel_price: 1,
                    fuel_limit: 10000,
                    ix_operations: [
                        {
                            type: OpType.LOGIC_INVOKE,
                            payload: {
                                logic_id: result.logic_id,
                                callsite: "Transfer",
                                calldata: "0x0d6f066596019502616d6f756e74032710726563656976657206b90f39fcf346ba3260518669495f5d368a8d1bb8023584f67e8a5671cf3c56c1",
                            }
                        }
                    ],
                });
            });

            test("should be able to listen to new logs", async () => {
                provider.on(
                    {
                        event: WebSocketEvent.NewLog,
                        params: {
                            address: wallet.getAddress(),
                            height: [-1, -1],
                            topics: [],
                        },
                    },
                    (log) => {
                        expect(log).toBeDefined();
                        expect(log.data).toBeDefined();
                    }
                );
            });
        });
    });
});
