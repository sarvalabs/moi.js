import { HttpTransport } from "../transport/http-transport";
import { JsonRpcProvider } from "./json-rpc-provider";

export class HttpProvider extends JsonRpcProvider {
    constructor(host: string) {
        super(new HttpTransport(host));
    }
}
