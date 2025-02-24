import EventEmitter from "events";
import { type JsonRpcResponse, type Transport } from "js-moi-utils";
export declare class HttpTransport extends EventEmitter implements Transport {
    private readonly host;
    private static HOST_REGEX;
    constructor(host: string);
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map