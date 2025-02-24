"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpProvider = void 0;
const http_transport_1 = require("../transport/http-transport");
const json_rpc_provider_1 = require("./json-rpc-provider");
class HttpProvider extends json_rpc_provider_1.JsonRpcProvider {
    constructor(host) {
        super(new http_transport_1.HttpTransport(host));
    }
}
exports.HttpProvider = HttpProvider;
//# sourceMappingURL=http-provider.js.map