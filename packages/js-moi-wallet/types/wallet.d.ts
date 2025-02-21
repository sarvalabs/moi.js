import { type Provider } from "js-moi-providers";

export interface WalletOption {
    keyId?: number;
    provider?: Provider;
}

export interface FromMnemonicOptions extends WalletOption {
    words?: string[];
}
