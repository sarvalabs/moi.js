import { styleText } from "node:util";
import { HttpProvider, OpType, Wallet, WebsocketProvider, type Provider } from "./packages/js-moi";

type ProviderType = "http" | "websocket";

//#region Constants
const MNEMONIC: string = "keep board tiger clean island wisdom apology when anger doctor pencil volcano";
const DEVIATION_PATH = "m/44'/6174'/0'/0/1";
const PROVIDER_TYPE = "http" as ProviderType;
const LOGIC_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";
//#endregion

const provider: Record<ProviderType, string> = {
    websocket: "ws://localhost:1600/ws",
    http: "http://localhost:1600",
};

const log = (message: string) => {
    console.log(styleText("cyan", `>> ${new Date().toISOString()} - ${message}`));
};

const createProvider = () => {
    if (!provider[PROVIDER_TYPE]) {
        throw new Error("PROVIDER_URL is not set");
    }

    log(`Creating ${PROVIDER_TYPE} provider with url ${provider[PROVIDER_TYPE]}`);

    let p: Provider | undefined = undefined;

    if (PROVIDER_TYPE === "websocket") {
        p = new WebsocketProvider(provider["websocket"]);
    }

    if (PROVIDER_TYPE === "http") {
        p = new HttpProvider(provider["http"]);
    }

    if (p == null) {
        throw new Error("Provider not created");
    }

    p.on("debug", (message) => {
        console.log(styleText("yellow", `DEBUG: ${JSON.stringify(message)}`));
    });

    return p;
};

const createWallet = async () => {
    return await Wallet.fromMnemonic(MNEMONIC, DEVIATION_PATH, {
        provider: createProvider(),
    });
};

const createNewParticipant = async () => {
    log("Creating new participant for testing");

    const wallet = await createWallet();
    const newWallet = await Wallet.createRandom({ provider: wallet.getProvider() });
    const newWalletIdentifier = await newWallet.getIdentifier();

    const ix = await wallet.execute({
        type: OpType.ParticipantCreate,
        payload: {
            id: newWalletIdentifier.toHex(),
            amount: 10000000,
            keys_payload: [
                {
                    public_key: await newWallet.getPublicKey(),
                    signature_algorithm: 0,
                    weight: 1000,
                },
            ],
        },
    });

    await ix.wait();
    log(`New Participant Created.\nAddress=${newWalletIdentifier.toHex()}`);
    return newWallet;
};

const getAssetId = async (wallet: Wallet) => {
    log("Searching for Asset ID");

    const provider = wallet.getProvider();
    const balances = await provider.getAccount(await wallet.getIdentifier(), {
        modifier: { extract: "balances" },
    });

    for (const balance of balances) {
        if (balance.asset_id) {
            log(`Asset ID=${balance.asset_id}`);
            return balance.asset_id;
        }
    }

    throw new Error("Asset ID not found");
};

const setup = async () => {
    log(`Starting testing setup`);

    process.env["PROVIDER_TYPE"] = PROVIDER_TYPE;
    process.env["PROVIDER_URL"] = provider[PROVIDER_TYPE];
    process.env["LOGIC_ID"] = LOGIC_ID;

    const wallet = await createNewParticipant();

    process.env["WALLET_PRIVATE_KEY"] = await wallet.getPrivateKey();
    process.env["WALLET_CURVE"] = await wallet.getCurve();
    process.env["WALLET_ADDRESS"] = (await wallet.getIdentifier()).toHex();
    process.env["WALLET_SEQUENCE_CURRENT"] = (await wallet.getProvider().getAccountKey(await wallet.getIdentifier(), 0)).sequence.toString();
    process.env["ASSET_ID"] = await getAssetId(wallet);

    log("Testing setup complete\n");
};

export default setup;
