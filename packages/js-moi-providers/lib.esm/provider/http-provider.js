import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
/**
 * HttpProvider is a class that extends JsonRpcProvider and uses HttpTransport.
 *
 * @param host The host to connect to.
 */
export class HttpProvider extends JsonRpcProvider {
    constructor(host) {
        super(new HttpTransport(host));
    }
}
//# sourceMappingURL=http-provider.js.map