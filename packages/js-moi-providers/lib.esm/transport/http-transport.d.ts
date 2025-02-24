import EventEmitter from "events";
import { type JsonRpcResponse, type Transport } from "js-moi-utils";
/**
 * HttpTransport is a transport that sends JSON-RPC messages over HTTP.
 *
 * @param host The URL of the HTTP server to send requests to.
 */
export declare class HttpTransport extends EventEmitter implements Transport {
    private readonly host;
    private static HOST_REGEX;
    constructor(host: string);
    /**
     * Sends a JSON-RPC request using `fetch`.
     *
     * @param request The JSON-RPC request to send.
     * @returns The JSON-RPC response
     */
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
//# sourceMappingURL=http-transport.d.ts.map