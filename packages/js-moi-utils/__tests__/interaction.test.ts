import { AssetStandard, bytesToHex, encodeInteraction, LockType, OpType, type InteractionRequest } from "../src.ts";

const interaction: InteractionRequest = {
    sender: {
        id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
        key_id: 0,
        sequence_id: 0,
    },
    funds: [
        {
            asset_id: "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000",
            amount: 100,
        },
    ],
    fuel_price: 1,
    fuel_limit: 200,
    operations: [
        {
            type: OpType.AssetCreate,
            payload: {
                symbol: "MOI",
                supply: 500,
                standard: AssetStandard.MAS0,
            },
        },
    ],
    participants: [
        {
            id: "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000",
            lock_type: LockType.MutateLock,
            notary: false,
        },
    ],
};

describe("Polo serialization of interaction", () => {
    test("should serialize an interaction", () => {
        const serialized = encodeInteraction(interaction);
        const expected =
            "0x0e9f020ee604e308f3088e09fe0dbe10b015b0155f06830483040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000000000000000000000000000000000000000000000000000000000000000000001c81f0e3f068304108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000641f0e2f0316050e7f063353535151504d4f4901f41f0e5f06830481040000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000";

        expect(bytesToHex(serialized)).toEqual(expected);
    });
});
