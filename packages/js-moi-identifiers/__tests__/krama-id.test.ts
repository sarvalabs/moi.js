import { KramaId, KramaIdKind, KramaIdVersion, NetworkZone } from "../src.ts/index";
import { hexToBytes } from "../src.ts/utils";

describe(KramaId, () => {
    const PRIVATE_KEY = "0xa8832f8228ba214ac1656a4a60739508aada64ad88a8a898d93daefafff08f93";
    const KRAMA_ID = "1116Uiu2HAm2itTsAm1YonwaN8c4XQoqa4egGJAMxwMuXpzNKTwh68E";

    let kramaId: KramaId;

    beforeAll(async () => {
        kramaId = await KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, PRIVATE_KEY);
    });

    it.concurrent("should create a krama id with any random private key", async () => {
        for (let i = 0; i < 10; i++) {
            const pKey = globalThis.crypto.getRandomValues(new Uint8Array(32));
            const kramaId = await KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, pKey);
            expect(kramaId).toBeInstanceOf(KramaId);
        }
    });

    it.concurrent("should create a Krama ID with the private key", async () => {
        const kramaId = await KramaId.fromPrivateKey(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, PRIVATE_KEY);

        expect(kramaId).toBeInstanceOf(KramaId);
        expect(kramaId.toString()).toBe(KRAMA_ID);
    });

    it.concurrent("should create a Krama ID with the peer ID", async () => {
        const peerId = await KramaId.peerIdFromPrivateKey(hexToBytes(PRIVATE_KEY));
        const kramaId = KramaId.fromPeerId(KramaIdKind.Guardian, KramaIdVersion.V0, NetworkZone.Zone0, peerId.toB58String());

        expect(kramaId).toBeInstanceOf(KramaId);
        expect(kramaId.toString()).toBe(KRAMA_ID);
    });

    it("should have correct network zone", async () => {
        expect(kramaId.getMetadata().getZone()).toBe(NetworkZone.Zone0);
    });

    it("should have correct peer ID", async () => {
        expect(kramaId.getPeerId()).toBe((await KramaId.peerIdFromPrivateKey(hexToBytes(PRIVATE_KEY))).toB58String());
    });

    it("should have correct decoded peer ID", async () => {
        const expected = await KramaId.peerIdFromPrivateKey(hexToBytes(PRIVATE_KEY));
        expect(kramaId.getDecodedPeerId().toString()).toEqual(expected.toString());
    });

    it("should have correct kind", async () => {
        expect(kramaId.getTag().getKind()).toBe(KramaIdKind.Guardian);
    });

    it("should have correct version", async () => {
        expect(kramaId.getTag().getVersion()).toBe(KramaIdVersion.V0);
    });
});
