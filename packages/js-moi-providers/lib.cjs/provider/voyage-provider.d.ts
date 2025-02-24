import { HttpProvider } from "./http-provider";
export declare enum NetworkType {
    /**
     * Babylon network.
     */
    Babylon = "https://voyage-rpc.moi.technology/babylon/"
}
/**
 * VoyageProvider is a provider for that communicates with the trusted nodes on the MOI network.
 */
export declare class VoyageProvider extends HttpProvider {
    /**
     * Constructor for the VoyageProvider.
     * @param type The network type.
     */
    constructor(type: NetworkType);
}
//# sourceMappingURL=voyage-provider.d.ts.map