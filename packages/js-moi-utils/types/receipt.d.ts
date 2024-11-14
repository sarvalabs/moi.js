
export interface AssetCreationResult {
    asset_id: string;
    address: string;
}

export interface AssetSupplyResult {
    total_supply: string;
}

export interface LogicDeployResult {
    logic_id?: string;
    error: string;
}

export interface LogicInvokeResult {
    outputs: string;
    error: string;
}

export interface LogicEnlistResult {
    outputs: string;
    error: string;
}
