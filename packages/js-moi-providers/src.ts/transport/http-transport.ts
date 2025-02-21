import EventEmitter from "events";
import { ErrorUtils, type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";

/**
 * HttpTransport is a transport that sends JSON-RPC messages over HTTP.
 *
 * @param host The URL of the HTTP server to send requests to.
 */
export class HttpTransport extends EventEmitter implements Transport {
    private readonly host: string;

    private static HOST_REGEX = /^https?:\/\/(?:(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}|localhost(?::\d+)?)\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    constructor(host: string) {
        if (!host) {
            ErrorUtils.throwArgumentError(`Http host is required`, "host", host);
        }

        if (!HttpTransport.HOST_REGEX.test(host)) {
            ErrorUtils.throwArgumentError(`Invalid host url "${host}"`, "host", host);
        }

        super();
        this.host = host;
    }

    /**
     * Sends a JSON-RPC request using `fetch`.
     *
     * @param request The JSON-RPC request to send.
     * @returns The JSON-RPC response
     */
    public async request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>> {
        const request: JsonRpcRequest = {
            jsonrpc: "2.0",
            id: globalThis.crypto.randomUUID(),
            method: method,
            params: params,
        };

        this.emit("debug", request);

        let result: JsonRpcResponse<TResult>;

        try {
            const content = JSON.stringify(request);
            const headers: HeadersInit = new Headers({
                "Content-Type": "application/json",
                "Content-Length": content.length.toString(),
                Accept: "application/json",
            });

            const response = await fetch(this.host, {
                method: "POST",
                body: content,
                headers: headers,
            });

            if (!response.ok) {
                result = {
                    jsonrpc: "2.0",
                    id: request.id,
                    error: {
                        code: response.status,
                        message: `Request failed`,
                        data: null,
                    },
                };
            }

            result = await response.json();
        } catch (error: any) {
            const isNetworkError = error?.cause?.code === "ECONNREFUSED" || error?.message === "Failed to fetch" || error?.code === "ConnectionRefused";
            const errMessage =
                isNetworkError ? `Network error. Cannot connect to ${this.host}`
                : "message" in error ? error.message
                : "Unknown error occurred";

            result = {
                jsonrpc: "2.0",
                id: request.id,
                error: { code: -1, message: errMessage, data: error },
            };
        }

        this.emit("debug", result);
        return result;
    }
}
