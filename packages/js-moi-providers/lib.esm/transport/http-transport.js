import EventEmitter from "events";
import { ErrorUtils } from "js-moi-utils";
export class HttpTransport extends EventEmitter {
    host;
    static HOST_REGEX = /^https?:\/\/(?:(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}|localhost(?::\d+)?)\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
    constructor(host) {
        if (!host) {
            ErrorUtils.throwArgumentError(`Http host is required`, "host", host);
        }
        if (!HttpTransport.HOST_REGEX.test(host)) {
            ErrorUtils.throwArgumentError(`Invalid host url "${host}"`, "host", host);
        }
        super();
        this.host = host;
    }
    async request(method, params) {
        const request = {
            jsonrpc: "2.0",
            id: globalThis.crypto.randomUUID(),
            method: method,
            params: params,
        };
        this.emit("debug", request);
        let result;
        try {
            const content = JSON.stringify(request);
            const headers = new Headers({
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
        }
        catch (error) {
            const isNetworkError = error?.cause?.code === "ECONNREFUSED" || error?.message === "Failed to fetch" || error?.code === "ConnectionRefused";
            const errMessage = isNetworkError ? `Network error. Cannot connect to ${this.host}`
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
//# sourceMappingURL=http-transport.js.map