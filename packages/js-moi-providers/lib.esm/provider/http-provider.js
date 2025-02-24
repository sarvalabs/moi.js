import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export class HttpProvider extends JsonRpcProvider {
    constructor(host) {
        super(new HttpTransport(host));
    }
}
//# sourceMappingURL=http-provider.js.map