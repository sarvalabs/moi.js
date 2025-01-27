import { ErrorUtils, type JsonRpcRequest, type JsonRpcResponse, type Transport } from "js-moi-utils";

type DebugArgument = {
    ok: boolean;
    request: JsonRpcRequest;
    response: JsonRpcResponse;
    error?: unknown;
    host: string;
};

export interface HttpTransportOption {
    debug?: (params: DebugArgument) => void;
}

export class HttpTransport implements Transport {
    private readonly host: string;

    private readonly option?: HttpTransportOption;

    private static HOST_REGEX = /^https?:\/\/(?:(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}|localhost(?::\d+)?)\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

    constructor(host: string, option?: HttpTransportOption) {
        if (!host) {
            ErrorUtils.throwArgumentError(`Http host is required`, "host", host);
        }

        if (!HttpTransport.HOST_REGEX.test(host)) {
            ErrorUtils.throwArgumentError(`Invalid host url "${host}"`, "host", host);
        }

        this.host = host;
        this.option = option;
    }

    private createPayload(method: string, params: unknown[]): JsonRpcRequest {
        return {
            jsonrpc: "2.0",
            id: 1,
            method: method,
            params: params,
        };
    }

    public async request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>> {
        const request = this.createPayload(method, params);
        let result: JsonRpcResponse<TResult>;

        try {
            const content = JSON.stringify(request);
            const headers: HeadersInit = new Headers({
                "Content-Type": "application/json",
                // "Content-Length": content.length.toString(),
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
                    id: 1,
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
            const errMessage = isNetworkError ? `Network error. Cannot connect to ${this.host}` : "message" in error ? error.message : "Unknown error occurred";

            result = {
                jsonrpc: "2.0",
                id: 1,
                error: { code: -1, message: errMessage, data: error },
            };
        }

        this.option?.debug?.({
            request,
            response: result,
            ok: "error" in result === false,
            error: "error" in result ? result.error : undefined,
            host: this.host,
        });

        return result;
    }
}
