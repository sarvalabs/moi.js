"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpTransport = void 0;
class HttpTransport {
    host;
    option;
    constructor(host, option) {
        this.host = host;
        this.option = option;
    }
    createPayload(method, params) {
        return {
            id: 1,
            jsonrpc: "2.0",
            method: method,
            params: params,
        };
    }
    async request(method, params) {
        const request = this.createPayload(method, params);
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
                    id: 1,
                    jsonrpc: "2.0",
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
            result = {
                id: 1,
                jsonrpc: "2.0",
                error: {
                    code: -1,
                    message: error instanceof Error ? error.message : "An unknown error occurred",
                    data: error,
                },
            };
        }
        this.option?.debug?.(request, {
            success: "result" in result,
            cause: "error" in result ? result.error : undefined,
        });
        return result;
    }
}
exports.HttpTransport = HttpTransport;
//# sourceMappingURL=http-transport.js.map