import EventEmitter from "events";
import type { JsonRpcRequest, JsonRpcResponse, Transport } from "js-moi-utils";
import { Websocket } from "../provider/ws/ws";

export interface WebsocketTransportOptions {
    reconnect?: number;
}

/**
 * WebsocketTransport is a transport that sends JSON-RPC messages over Websocket.
 */
export class WebsocketTransport extends EventEmitter implements Transport {
    private readonly options: WebsocketTransportOptions;

    private readonly address: string;

    private reconnects = 0;

    private ws?: Websocket;

    private waitForConnectionPromise?: Promise<void>;

    constructor(socket: string, options: WebsocketTransportOptions = {}) {
        super();

        if (!WebsocketTransport.isValidWebSocketUrl(socket)) {
            throw new Error("Invalid websocket url");
        }

        const err = WebsocketTransport.validateOptions(options);

        if (err != null) {
            throw err;
        }

        this.address = socket;
        this.options = options;

        this.createNewConnection();
    }

    protected createNewConnection(): void {
        this.ws = new Websocket(this.address);

        this.ws.onopen = (e) => {
            this.reconnects = 0;
            this.emit("open", e);
        };

        this.ws.onclose = (e) => {
            return this.emit("close", e);
        };

        this.ws.onmessage = (event) => {
            return this.emit("message", event.data);
        };

        this.ws.onerror = (error) => {
            if (this.options.reconnect && this.reconnects < this.options.reconnect) {
                this.reconnects += 1;
                this.createNewConnection();
                this.waitForConnectionPromise = undefined;
                this.emit("reconnect", this.reconnects);
            }

            this.emit("error", error);
        };
    }

    private waitForConnection(): Promise<void> {
        this.waitForConnectionPromise ??= new Promise((resolve, reject) => {
            if (this.ws == null) {
                reject(new Error("Websocket is not initialized"));
                return;
            }

            if (this.ws.readyState === Websocket.CONNECTING) {
                const openListener = () => {
                    // If connection established, resolve the promise and
                    // remove listeners for closing and error events
                    this.off("close", closeListener);
                    this.off("error", errorListener);
                    resolve();
                };

                const closeListener = () => {
                    this.off("open", openListener);
                    reject(new Error("Websocket is closed"));
                };

                const errorListener = (error: Error) => {
                    this.off("open", openListener);
                    reject(error);
                };

                this.once("open", openListener);
                this.once("close", closeListener);
                this.once("error", errorListener);
                return;
            }

            if (this.ws.readyState === Websocket.OPEN) {
                return resolve();
            }

            if (this.options.reconnect && this.reconnects < this.options.reconnect) {
                return;
            }

            if (this.ws.CLOSED === Websocket.CLOSED || this.ws.CLOSING === Websocket.CLOSING) {
                throw new Error("Websocket is closed, cannot reconnect");
            }
        });

        return this.waitForConnectionPromise;
    }

    /**
     * Sends a JSON-RPC request over a WebSocket connection and returns the response.
     *
     * @param {string} method - The JSON-RPC method to be invoked.
     * @param {unknown[]} [param=[]] - The parameters to be sent with the JSON-RPC request.
     * @returns {Promise<JsonRpcResponse<TResult>>} - A promise that resolves with the JSON-RPC response.
     * @throws Will throw an error if the response cannot be parsed or if the request fails.
     */
    public async request<TResult = unknown>(method: string, param: unknown[] = []): Promise<JsonRpcResponse<TResult>> {
        await this.waitForConnection();

        return new Promise((resolve, reject) => {
            const request: JsonRpcRequest = {
                id: globalThis.crypto.randomUUID(),
                jsonrpc: "2.0",
                method: method,
                params: param,
            };

            this.emit("debug", request);

            const listener = (data: string) => {
                try {
                    const response = JSON.parse(data) as JsonRpcResponse;

                    if (response.id !== request.id) {
                        return;
                    }

                    resolve(response as JsonRpcResponse<TResult>);
                    this.emit("debug", response);
                    this.off("message", listener);
                } catch (error) {
                    reject(error);
                    this.off("message", listener);
                }
            };

            this.on("message", listener);
            this.send(request);
        });
    }

    /**
     * Closes the WebSocket connection.
     *
     * @throws {Error} If the WebSocket is not initialized.
     */
    public close(): void {
        if (this.ws == null) {
            throw new Error("Websocket is not initialized");
        }
        this.ws.close();
    }

    protected send(data: unknown): void {
        if (this.ws == null) {
            throw new Error("Websocket is not initialized");
        }

        this.ws.send(JSON.stringify(data));
    }

    private static validateOptions(options: WebsocketTransportOptions): Error | null {
        if (options.reconnect != null && options.reconnect < 0) {
            return new Error("Reconnect must be a positive number");
        }

        return null;
    }

    private static isValidWebSocketUrl(url: string) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "ws:" || parsedUrl.protocol === "wss:";
        } catch (e) {
            return false;
        }
    }
}
