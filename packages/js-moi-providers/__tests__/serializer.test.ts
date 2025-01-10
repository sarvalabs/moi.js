import { AssetStandard, bytesToHex, OpType } from "js-moi-utils";
import { InteractionSerializer, MutateLock, type IxOperation } from "../src.ts";
import type { BaseInteractionRequest } from "../src.ts/types/moi-rpc-method.ts";

const serializer = new InteractionSerializer();

interface TestCase {
    name: string;
    payload: IxOperation;
    expected: string;
}

describe("Polo serialization of ix operation payload", () => {
    const tests: TestCase[] = [
        {
            name: "should serialize a asset create operation payload",
            payload: {
                type: OpType.ASSET_CREATE,
                payload: {
                    symbol: "MOI",
                    supply: 500,
                    standard: AssetStandard.MAS0,
                },
            },
            expected: "0x0e7f063353535151504d4f4901f4",
        },
        {
            name: "should serialize a participant create operation payload",
            payload: {
                type: OpType.PARTICIPANT_CREATE,
                payload: {
                    address: "0x28027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d64",
                    amount: 100,
                    keys_payload: [],
                },
            },
            expected: "0x0e5f068e04930428027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d640f64",
        },
        {
            name: "should serialize a asset mint operation payload",
            payload: {
                type: OpType.ASSET_MINT,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc668",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363864",
        },
        {
            name: "should serialize a asset burn operation payload",
            payload: {
                type: OpType.ASSET_BURN,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc661",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363164",
        },
        {
            name: "should serialize a asset transfer operation payload",
            payload: {
                type: OpType.ASSET_TRANSFER,
                payload: {
                    benefactor: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757",
                    beneficiary: "0x86d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f4",
                    asset_id: "0x000000004cd973c4eb83cdb8870c0de209736270491b7acc99873da1eddced5826c3b548",
                    amount: 100,
                    timestamp: 1736513677,
                },
            },
            expected:
                "0x0e9f010686048608a311b31194c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c875786d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f43078303030303030303034636439373363346562383363646238383730633064653230393733363237303439316237616363393938373364613165646463656435383236633362353438646781188d",
        },
        {
            name: "should serialize a logic deploy operation payload",
            payload: {
                type: OpType.LOGIC_DEPLOY,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    interfaces: {
                        ["hello"]: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    },
                },
            },
            expected:
                "0x0e9f0106b604b604e6059e0a080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c73697465080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b7822f065668656c6c6f307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832",
        },

        {
            name: "should serialize a logic deploy operation payload when calldata is not provided",
            payload: {
                type: OpType.LOGIC_DEPLOY,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    interfaces: {
                        ["hello"]: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    },
                },
            },
            expected:
                "0x0e9f0106b604b604e005ee05080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c736974652f065668656c6c6f307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832",
        },
        {
            name: "should serialize a logic deploy operation payload when interfaces is not provided",
            payload: {
                type: OpType.LOGIC_DEPLOY,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected: "0x0e9f0106b604b604e005e005080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c73697465",
        },
        {
            name: "should serialize a logic enlist operation payload",
            payload: {
                type: OpType.LOGIC_ENLIST,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected:
                "0x0e8f0100068609b00ab00a307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c73697465",
        },
        {
            name: "should serialize a logic invoke operation payload",
            payload: {
                type: OpType.LOGIC_INVOKE,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
                },
            },
            expected:
                "0x0e8f0100068609b60a800e307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c736974650d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
        },
    ];

    for (const test of tests) {
        it(test.name, () => {
            const serialized = serializer.serializeOperation(test.payload);
            expect(bytesToHex(serialized)).toEqual(test.expected);
        });
    }
});

describe("Polo serialization of interaction", () => {
    const interaction: BaseInteractionRequest = {
        sender: {
            address: "0x4860657690bb4518ceea81ec5d465da4071864e8ab277a7636b02f63ce5200ae",
            key_id: 0,
            sequence: 0,
        },
        funds: [],
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.LOGIC_INVOKE,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
                },
            },
        ],
        participants: [
            {
                address: "0x4860657690bb4518ceea81ec5d465da4071864e8ab277a7636b02f63ce5200ae",
                lock: MutateLock.MutateLock,
                notary: false,
            },
        ],
    };

    test("should serialize an interaction", () => {
        const serialized = serializer.serialize(interaction);
        const expected =
            "0x0e9f020ee604e308f30880098e099e19901e901e5f06830483044860657690bb4518ceea81ec5d465da4071864e8ab277a7636b02f63ce5200ae000000000000000000000000000000000000000000000000000000000000000001c81f0e2f03160d0e8f0100068609b60a800e307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c736974650d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f491f0e5f06830481044860657690bb4518ceea81ec5d465da4071864e8ab277a7636b02f63ce5200ae";

        expect(bytesToHex(serialized)).toEqual(expected);
    });
});
