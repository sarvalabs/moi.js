import { HttpProvider, WebsocketProvider, type Provider } from "js-moi-providers";
import { Wallet, type CURVE } from "../src.ts";

const createProvider = (): Provider => {
    const url = process.env.PROVIDER_URL;

    if (!url) {
        throw new Error("Provider URL not found");
    }

    switch (process.env.PROVIDER_TYPE) {
        case "http":
            return new HttpProvider(url);
        case "websocket":
            return new WebsocketProvider(url);
        default:
            throw new Error("Invalid provider type");
    }
};

export const createWallet = (): Wallet => {
    const privateKey = process.env.WALLET_PRIVATE_KEY;

    if (!privateKey) {
        throw new Error("Wallet private key not found");
    }

    const curve = process.env.WALLET_CURVE as CURVE | undefined;

    if (!curve) {
        throw new Error("Wallet curve not found");
    }

    return new Wallet(privateKey, curve, { provider: createProvider() });
};
