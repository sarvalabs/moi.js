"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoyageProvider = exports.NetworkType = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const http_provider_1 = require("./http-provider");
var NetworkType;
(function (NetworkType) {
    /**
     * Babylon network.
     */
    NetworkType["Babylon"] = "https://voyage-rpc.moi.technology/babylon/";
})(NetworkType || (exports.NetworkType = NetworkType = {}));
/**
 * VoyageProvider is a provider for that communicates with the trusted nodes on the MOI network.
 */
class VoyageProvider extends http_provider_1.HttpProvider {
    /**
     * Constructor for the VoyageProvider.
     * @param type The network type.
     */
    constructor(type) {
        if (type !== NetworkType.Babylon) {
            js_moi_utils_1.ErrorUtils.throwError("Unsupported network type", js_moi_utils_1.ErrorCode.UNSUPPORTED_OPERATION, {
                type,
            });
        }
        super(type);
    }
}
exports.VoyageProvider = VoyageProvider;
//# sourceMappingURL=voyage-provider.js.map