import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { HttpProvider } from "./http-provider";

export enum NetworkType {
    /**
     * Babylon network.
     */
    Babylon = "https://voyage-rpc.moi.technology/babylon/",
}

/**
 * VoyageProvider is a provider for that communicates with the trusted nodes on the MOI network.
 */
export class VoyageProvider extends HttpProvider {
    /**
     * Constructor for the VoyageProvider.
     * @param type The network type.
     */
    constructor(type: NetworkType) {
        if (type !== NetworkType.Babylon) {
            ErrorUtils.throwError("Unsupported network type", ErrorCode.UNSUPPORTED_OPERATION, {
                type,
            });
        }

        super(type);
    }
}
