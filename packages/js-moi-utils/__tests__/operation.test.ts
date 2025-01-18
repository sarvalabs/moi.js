import { AssetStandard, bytesToHex, encodeOperation, getIxOperationDescriptor, listIxOperationDescriptors, OpType, type IxOp } from "../src.ts";

interface TestCase {
    operation: IxOp;
    expected: string;
}

describe(encodeOperation, () => {
    const cases: TestCase[] = [
        {
            operation: {
                type: OpType.AssetCreate,
                payload: {
                    symbol: "MOI",
                    supply: 500,
                    standard: AssetStandard.MAS0,
                    is_logical: false,
                    dimension: 0,
                    is_stateful: false,
                },
            },
            expected: "0x0e7f063353535151504d4f4901f4",
        },
        {
            operation: {
                type: OpType.ParticipantCreate,
                payload: {
                    address: "0x28027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d64",
                    amount: 100,
                    keys_payload: [],
                },
            },
            expected: "0x0e5f068e04930428027ab68bd59c6cf54c83b32e02126859809436cd141b341d5fcb02bf7f6d640f64",
        },
        {
            operation: {
                type: OpType.AssetMint,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc668",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363864",
        },
        {
            operation: {
                type: OpType.AssetBurn,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc661",
                    amount: 100,
                },
            },
            expected:
                "0x0e3f06a309307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363164",
        },
        {
            operation: {
                type: OpType.AssetTransfer,
                payload: {
                    beneficiary: "0x86d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f4",
                    asset_id: "0x000000004cd973c4eb83cdb8870c0de209736270491b7acc99873da1eddced5826c3b548",
                    amount: 100,
                },
            },
            expected:
                "0x0e9f010686048608a311b311000000000000000000000000000000000000000000000000000000000000000086d8826ac7dc4ffb73fae39dedf72958a405b878f25ed362f2f496c60a4604f4307830303030303030303463643937336334656238336364623838373063306465323039373336323730343931623761636339393837336461316564646365643538323663336235343864",
        },
        {
            operation: {
                type: OpType.LogicDeploy,
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
            operation: {
                type: OpType.LogicDeploy,
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
            operation: {
                type: OpType.LogicDeploy,
                payload: {
                    manifest: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected: "0x0e9f0106b604b604e005e005080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782416e7943616c6c73697465",
        },
        {
            operation: {
                type: OpType.LogicEnlist,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                },
            },
            expected:
                "0x0e8f0100068609b00ab00a307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c73697465",
        },
        {
            operation: {
                type: OpType.LogicInvoke,
                payload: {
                    logic_id: "0x080000fc61d49266591e2c6fa27f60973e085586d26acab0c7f0d354bf9c61afe7b782",
                    callsite: "AnyCallsite",
                    calldata: "0x0d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
                },
            },
            expected:
                "0x0e8f0100068609b60a800e307830383030303066633631643439323636353931653263366661323766363039373365303835353836643236616361623063376630643335346266396336316166653762373832416e7943616c6c736974650d6f0665b6019502737570706c790305f5e10073796d626f6c064d4f49",
        },
        {
            operation: {
                type: OpType.AssetApprove,
                payload: {
                    beneficiary: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757",
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc668",
                    amount: 100,
                    timestamp: 86400000,
                },
            },
            expected:
                "0x0e9f010686048608a311b311000000000000000000000000000000000000000000000000000000000000000094c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c875730783030303030303030613966356538343633626162633139373235326465333361323635656566633731633334393734343063303666616132333362646139343132356462633636386405265c00",
        },
        {
            operation: {
                type: OpType.AssetRelease,
                payload: {
                    benefactor: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757",
                    beneficiary: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757",
                    amount: 100,
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc668",
                },
            },
            expected:
                "0x0e9f010686048608a311b31194c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c875794c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8757307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363864",
        },
        {
            operation: {
                type: OpType.AssetLockup,
                payload: {
                    amount: 100,
                    asset_id: "0x00000000a9f5e8463babc197252de33a265eefc71c3497440c06faa233bda94125dbc661",
                    beneficiary: "0x94c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8751",
                },
            },
            expected:
                "0x0e9f010686048608a311b311000000000000000000000000000000000000000000000000000000000000000094c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8751307830303030303030306139663565383436336261626331393732353264653333613236356565666337316333343937343430633036666161323333626461393431323564626336363164",
        },
        {
            operation: {
                type: OpType.AssetRevoke,
                payload: {
                    asset_id: "0x00000000a9f5e8463babc297252de33a265eeac71c3497440c06faa233bda94125dbc661",
                    beneficiary: "0x14c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c8751",
                },
            },
            // TODO: POLO 1 bytes is off
            expected:
                "0x0e9f010686048608a011a311000000000000000000000000000000000000000000000000000000000000000014c1e6005ba03c48130c9c32c1fd7d1a0364413253eb5cf1c56164f93a6c87513078303030303030303061396635653834363362616263323937323532646533336132363565656163373163333439373434306330366661613233336264613934313235646263363631",
        },
    ];

    it.each(cases.map((v) => ({ ...v, name: OpType[v.operation.type] })))("should encodes $name operation with correct payload and type matching", ({ operation, expected }) => {
        const { payload, type } = encodeOperation(operation);

        expect(type).toBe(operation.type);
        expect(bytesToHex(payload)).toEqual(expected);
    });

    it("should throw an error when an unknown operation type is provided", () => {
        const operation = {
            type: 0x0f,
            payload: {},
        };

        expect(() => encodeOperation(operation as IxOp)).toThrow();
    });
});

describe(listIxOperationDescriptors, () => {
    it("should list all operation descriptors", () => {
        const descriptors = listIxOperationDescriptors();
        expect(descriptors.length).toBeGreaterThan(0);
    });
});

describe(getIxOperationDescriptor, () => {
    it("should return a logic deploy operation descriptor", () => {
        const record = listIxOperationDescriptors().find((record) => record.type === OpType.LogicDeploy);

        expect(getIxOperationDescriptor(OpType.LogicDeploy)).toBe(record?.descriptor);
    });
});
