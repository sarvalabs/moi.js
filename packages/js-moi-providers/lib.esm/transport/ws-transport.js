import EventEmitter from "events";
import { Websocket } from "../provider/ws/ws";
export class WebsocketTransport extends EventEmitter {
    options;
    address;
    reconnects = 0;
    ws;
    waitForConnectionPromise;
    constructor(socket, options = {}) {
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
    createNewConnection() {
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
    waitForConnection() {
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
                const errorListener = (error) => {
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
    async request(method, params) {
        await this.waitForConnection();
        const request = this.createPayload(method, params);
        return new Promise((resolve, reject) => {
            const listener = (data) => {
                try {
                    const response = JSON.parse(data);
                    if (response.id !== request.id) {
                        return;
                    }
                    resolve({ ...response, id: 1 });
                    this.off("message", listener);
                }
                catch (error) {
                    reject(error);
                    this.off("message", listener);
                }
            };
            this.on("message", listener);
            this.send(request);
        });
    }
    close() {
        if (this.ws == null) {
            throw new Error("Websocket is not initialized");
        }
        console.log("close");
        this.ws.close();
    }
    createId() {
        return globalThis.crypto.randomUUID();
    }
    createPayload(method, params) {
        return {
            id: this.createId(),
            jsonrpc: "2.0",
            method,
            params,
        };
    }
    send(data) {
        if (this.ws == null) {
            throw new Error("Websocket is not initialized");
        }
        this.ws?.send(JSON.stringify(data));
    }
    static validateOptions(options) {
        if (options.reconnect != null && options.reconnect < 0) {
            return new Error("Reconnect must be a positive number");
        }
        return null;
    }
    static isValidWebSocketUrl(url) {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.protocol === "ws:" || parsedUrl.protocol === "wss:";
        }
        catch (e) {
            return false;
        }
    }
}
//# sourceMappingURL=ws-transport.js.map