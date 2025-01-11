import { hexToBytes, OpType } from "js-moi-utils";
import { Polorizer, type Schema } from "js-polo";
import { polo } from "polo-schema";
import type { OperationPayload } from "../types/moi-rpc-method";

export abstract class OperationSerializer {
    public abstract readonly type: number;

    public abstract readonly schema: Schema;

    public serialize(payload: any): Uint8Array {
        const polorizer = new Polorizer();
        polorizer.polorize(payload, this.schema);
        return polorizer.bytes();
    }
}

export class AssetCreateSerializer extends OperationSerializer {
    public readonly type: OpType = OpType.AssetCreate;

    public readonly schema: Schema = polo.struct({
        symbol: polo.string,
        supply: polo.integer,
        standard: polo.integer,
        dimension: polo.integer,
        is_stateful: polo.boolean,
        is_logical: polo.boolean,
        logic_payload: polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interface: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        }),
    });
}

const createAssetSupplySerializer = (type: OpType) => {
    return class AssetSupplySerializer extends OperationSerializer {
        public readonly type = type;

        public readonly schema: Schema = polo.struct({
            asset_id: polo.string,
            amount: polo.integer,
        });
    };
};

export const AssetMintSerializer = createAssetSupplySerializer(OpType.AssetMint);

export const AssetBurnSerializer = createAssetSupplySerializer(OpType.AssetBurn);

export class ParticipantCreateSerializer extends OperationSerializer {
    public readonly type = OpType.ParticipantCreate;

    public readonly schema: Schema = {
        kind: "struct",
        fields: {
            address: polo.bytes,
            keys_payload: polo.arrayOf(
                polo.struct({
                    public_key: polo.bytes,
                    weight: polo.integer,
                    signature_algorithm: polo.integer,
                })
            ),
            amount: polo.integer,
        },
    };

    override serialize(payload: OperationPayload<OpType.ParticipantCreate>): Uint8Array {
        return super.serialize({ ...payload, address: hexToBytes(payload.address) });
    }
}

export class AssetActionSerializer extends OperationSerializer {
    public readonly type = OpType.AssetTransfer;

    public readonly schema: Schema = polo.struct({
        benefactor: polo.bytes,
        beneficiary: polo.bytes,
        asset_id: polo.string,
        amount: polo.integer,
        timestamp: polo.integer,
    });

    public override serialize(payload: OperationPayload<OpType.AssetTransfer>): Uint8Array {
        return super.serialize({
            ...payload,
            benefactor: hexToBytes(payload.benefactor),
            beneficiary: hexToBytes(payload.beneficiary),
        });
    }
}

const createLogicActionSerializer = (type: OpType) => {
    return class LogicActionSerializer extends OperationSerializer {
        public readonly type = type;

        public readonly schema: Schema = polo.struct({
            manifest: polo.bytes,
            logic_id: polo.string,
            callsite: polo.string,
            calldata: polo.bytes,
            interfaces: polo.map({
                keys: polo.string,
                values: polo.string,
            }),
        });

        override serialize(payload: OperationPayload<OpType.LogicDeploy | OpType.LogicEnlist | OpType.LogicInvoke>): Uint8Array {
            return super.serialize({
                ...payload,
                manifest: "manifest" in payload && payload.manifest != null ? hexToBytes(payload.manifest) : undefined,
                calldata: payload.calldata != null ? hexToBytes(payload.calldata) : undefined,
                interfaces: "interfaces" in payload && payload.interfaces != null ? new Map(Object.entries(payload.interfaces)) : undefined,
            });
        }
    };
};

export const LogicDeploySerializer = createLogicActionSerializer(OpType.LogicDeploy);

export const LogicInvokeSerializer = createLogicActionSerializer(OpType.LogicInvoke);

export const LogicEnlistSerializer = createLogicActionSerializer(OpType.LogicEnlist);
