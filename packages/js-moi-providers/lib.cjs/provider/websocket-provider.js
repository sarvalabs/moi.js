"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = exports.WebsocketEvent = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const ws_transport_1 = require("../transport/ws-transport");
const json_rpc_provider_1 = require("./json-rpc-provider");
var WebsocketEvent;
(function (WebsocketEvent) {
    WebsocketEvent["Error"] = "error";
    WebsocketEvent["Open"] = "open";
    WebsocketEvent["Debug"] = "debug";
    WebsocketEvent["Close"] = "close";
    WebsocketEvent["Reconnect"] = "reconnect";
    WebsocketEvent["Message"] = "message";
    WebsocketEvent["NewPendingInteractions"] = "newPendingInteractions";
    WebsocketEvent["NewTesseracts"] = "newTesseracts";
    WebsocketEvent["NewTesseractsByAccount"] = "newTesseractsByAccount";
    WebsocketEvent["NewLogs"] = "newLogs";
})(WebsocketEvent || (exports.WebsocketEvent = WebsocketEvent = {}));
class WebsocketProvider extends json_rpc_provider_1.JsonRpcProvider {
    static events = {
        client: new Set(["error", "open", "close", "reconnect", "debug"]),
        internal: new Set(["message"]),
        network: new Set(["newPendingInteractions", "newTesseracts", "newTesseractsByAccount", "newLogs"]),
    };
    // mapping of subscription id to event, listener
    subscriptions = new Map();
    constructor(address, options) {
        super(new ws_transport_1.WebsocketTransport(address, options));
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            for (const event of WebsocketProvider.events.client) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }
    getSubscriptions() {
        return Array.from(Iterator.from(this.subscriptions).map(([id, event]) => ({ id, event })));
    }
    close() {
        if (this.transport instanceof ws_transport_1.WebsocketTransport) {
            this.transport.close();
        }
    }
    async handleOnNetworkEventSubscription(type, event, listener) {
        const params = typeof event === "object" ? (event.params ?? []) : [];
        const eventName = WebsocketProvider.getEventName(event);
        if (typeof eventName === "symbol") {
            js_moi_utils_1.ErrorUtils.throwArgumentError("Cannot subscribe to a symbol event", "event", event);
        }
        const id = await this.subscribe(eventName, params);
        const transport = this.transport;
        super[type](eventName, listener);
        this.subscriptions.set(id, { event, listener });
        transport.on("message", (message) => {
            const data = JSON.parse(message);
            const isValidMessage = WebsocketProvider.isWebsocketEmittedResponse(data) && data.params.subscription === id;
            if (!isValidMessage) {
                return;
            }
            super.emit(eventName, data.params.result);
        });
    }
    on(event, listener) {
        return this.subscribeToEvent("on", event, listener);
    }
    once(eventName, listener) {
        return this.subscribeToEvent("once", eventName, listener);
    }
    subscribeToEvent(type, event, listener) {
        const eventName = WebsocketProvider.getEventName(event);
        if (WebsocketProvider.events.network.has(eventName)) {
            this.handleOnNetworkEventSubscription(type, event, listener);
            return this;
        }
        super[type](eventName, listener);
        return this;
    }
    off(eventName, listener) {
        return this.unsubscribeFromEvent(eventName, listener);
    }
    unsubscribeFromEvent(event, listener) {
        const eventName = WebsocketProvider.getEventName(event);
        if (WebsocketProvider.events.network.has(eventName)) {
            void this.unsubscribeFromNetworkEvent(event, listener);
        }
        return super.off(eventName, listener);
    }
    async unsubscribeFromNetworkEvent(event, listener) {
        const entry = this.subscriptions.entries().find((value) => value[1].listener === listener);
        const eventName = WebsocketProvider.getEventName(event);
        if (entry == null) {
            super.off(eventName, listener);
            return;
        }
        await this.unsubscribe(entry[0]);
        super.off(eventName, listener);
    }
    static isWebsocketEmittedResponse(response) {
        return "params" in response && "subscription" in response.params && "result" in response.params;
    }
    static getEventName(event) {
        return typeof event === "object" ? event.event : event;
    }
}
exports.WebsocketProvider = WebsocketProvider;
//# sourceMappingURL=websocket-provider.js.map