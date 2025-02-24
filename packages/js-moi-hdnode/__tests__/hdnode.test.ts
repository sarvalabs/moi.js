import { mnemonicToSeed } from "js-moi-bip39";
import { HDNode } from "../src.ts/hdnode";

describe("Test HDNode", () => {
    let hdNode: HDNode;

    const mnemonic = "behind wish visual father mixture tackle together nurse asset stumble attack erode";

    beforeAll(async () => {
        const seed = await mnemonicToSeed(mnemonic);
        hdNode = HDNode.fromSeed(seed);
    });

    test("Generate an HDNode from a seed", async () => {
        const seed = await mnemonicToSeed(mnemonic);
        const hdNode = HDNode.fromSeed(seed);
        expect(hdNode).toBeInstanceOf(HDNode);
    });

    test("Derive a child HDNode from the current HDNode using the specified path", async () => {
        const childHDNode = hdNode.derivePath("m/44'/7567'/0'/0/1");
        expect(childHDNode).toBeInstanceOf(HDNode);
    });

    test("Derive a child HDNode from the current HDNode using the specified index", () => {
        const childHDNode = hdNode.deriveChild(5);
        expect(childHDNode).toBeInstanceOf(HDNode);
    });

    test("Retrieve the public key associated with the HDNode", () => {
        const publicKey = hdNode.publicKey();
        const expectedPubKey = new Uint8Array([
            2, 133, 175, 224, 48, 149, 186, 84, 235, 184, 154, 3, 211, 4, 17, 120, 162, 139, 238, 30, 175, 163, 45, 52, 214, 112, 27, 248, 215, 144, 133, 209, 178,
        ]);
        expect(publicKey).toBeInstanceOf(Uint8Array);
        expect(publicKey).toStrictEqual(expectedPubKey);
    });

    test("Retrieve the private key associated with the HDNode", () => {
        const privateKey = hdNode.privateKey();
        const expectedPrivKey = new Uint8Array([
            214, 53, 216, 15, 167, 33, 168, 240, 230, 3, 54, 175, 228, 86, 35, 31, 231, 19, 176, 218, 3, 205, 96, 84, 29, 20, 42, 202, 100, 183, 87, 137,
        ]);
        expect(privateKey).toBeInstanceOf(Uint8Array);
        expect(privateKey).toStrictEqual(expectedPrivKey);
    });
});
