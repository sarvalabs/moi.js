import { ErrorUtils, type Hex, type Tesseract } from "js-moi-utils";
import { WebsocketTransport, type WebsocketTransportOptions } from "../transport/ws-transport";
import { JsonRpcProvider } from "./json-rpc-provider";

export enum WebsocketEvent {
    Error = "error",
    Open = "open",
    Debug = "debug",
    Close = "close",
    Reconnect = "reconnect",
    Message = "message",
    NewPendingInteractions = "newPendingInteractions",
    NewTesseracts = "newTesseracts",
    NewTesseractsByAccount = "newTesseractsByAccount",
    NewLogs = "newLogs",
}

type BaseListener = (...args: any[]) => void;

type DebugParam = { action: string; payload: unknown };

export type ProviderEvent =
    | WebsocketEvent.Close
    | WebsocketEvent.Error
    | WebsocketEvent.Open
    | WebsocketEvent.Reconnect
    | WebsocketEvent.Message
    | WebsocketEvent.NewPendingInteractions
    | WebsocketEvent.NewTesseracts
    | { event: WebsocketEvent.NewTesseractsByAccount; params: [{ address: Hex }] }
    | { event: WebsocketEvent.NewLogs; params: [{ start_height: number; end_height: number; address: Hex; topics: any[] }] }
    | string
    | symbol;

type WebsocketEventListener<TEvent extends WebsocketEvent> =
    TEvent extends WebsocketEvent.NewPendingInteractions ? (hash: string) => void
    : TEvent extends WebsocketEvent.NewTesseracts | WebsocketEvent.NewTesseractsByAccount ? (tesseracts: Tesseract) => void
    : TEvent extends WebsocketEvent.Reconnect ? (reconnects: number) => void
    : TEvent extends WebsocketEvent.Error ? (error: Error) => void
    : TEvent extends WebsocketEvent.Message ? (message: any) => void
    : TEvent extends WebsocketEvent.Debug ? (data: DebugParam) => void
    : TEvent extends WebsocketEvent.Open | WebsocketEvent.Close ? () => void
    : BaseListener;

type ProviderEventListener<TEvent extends ProviderEvent> =
    TEvent extends string ?
        TEvent extends WebsocketEvent ?
            WebsocketEventListener<TEvent>
        :   BaseListener
    : TEvent extends symbol ? BaseListener
    : TEvent extends { event: infer TEventType } ?
        TEventType extends WebsocketEvent ?
            WebsocketEventListener<TEventType>
        :   never
    :   never;

type WebsocketEmittedResponse = {
    params: {
        subscription: string;
        result: unknown;
    };
};

/**
 * WebsocketProvider is a provider that connects to a network via a websocket connection.
 *
 * It extends the JsonRpcProvider and adds the ability to subscribe to network events.
 */
export class WebsocketProvider extends JsonRpcProvider {
    private static events: Record<string, Set<string | symbol>> = {
        client: new Set(["error", "open", "close", "reconnect", "debug"]),
        internal: new Set(["message"]),
        network: new Set<string>(["newPendingInteractions", "newTesseracts", "newTesseractsByAccount", "newLogs"]),
    };

    // mapping of subscription id to event, listener
    private readonly subscriptions = new Map<string, { event: ProviderEvent; listener: BaseListener }>();

    constructor(address: string, options?: WebsocketTransportOptions) {
        super(new WebsocketTransport(address, options));

        if (this.transport instanceof WebsocketTransport) {
            for (const event of WebsocketProvider.events.client) {
                this.transport.on(event, (...args) => this.emit(event, ...args));
            }
        }
    }

    /**
     * Retrieves the current list of subscriptions.
     *
     * @returns An array of subscription objects, each containing an `id` and an `event`.
     */
    getSubscriptions() {
        return Array.from(Iterator.from(this.subscriptions).map(([id, event]) => ({ id, event })));
    }

    /**
     * Closes the WebSocket connection if the transport is an instance of WebsocketTransport.
     * This method ensures that the WebSocket connection is properly terminated.
     *
     * @returns {void}
     */
    close(): void {
        if (this.transport instanceof WebsocketTransport) {
            this.transport.close();
        }
    }

    private async handleOnNetworkEventSubscription(type: "on" | "once", event: ProviderEvent, listener: (...args: any[]) => void): Promise<void> {
        const params = typeof event === "object" ? (event.params ?? []) : [];
        const eventName = WebsocketProvider.getEventName(event);

        if (typeof eventName === "symbol") {
            ErrorUtils.throwArgumentError("Cannot subscribe to a symbol event", "event", event);
        }

        const id = await this.subscribe(eventName, params);
        const transport = this.transport as WebsocketTransport;

        super[type](eventName, listener);
        this.subscriptions.set(id, { event, listener });

        transport.on("message", (message: string) => {
            const data = JSON.parse(message);
            const isValidMessage = WebsocketProvider.isWebsocketEmittedResponse(data) && data.params.subscription === id;

            if (!isValidMessage) {
                return;
            }

            super.emit(eventName, data.params.result);
        });
    }

    /**
     * Registers an event listener for a specified provider event.
     *
     * @param event - The event to listen for.
     * @param listener - The callback function to be invoked when the event occurs.
     * @returns The current instance to allow method chaining.
     */
    on<K, T extends ProviderEvent>(event: T, listener: ProviderEventListener<T>): this {
        return this.subscribeToEvent<K>("on", event, listener);
    }

    /**
     * Registers an event listener for a specified provider event that will only be called once.
     *
     * @param event - The event to listen for.
     * @param listener - The callback function to be invoked when the event occurs.
     * @returns The current instance to allow method chaining.
     */
    once<K, T extends ProviderEvent>(eventName: T, listener: ProviderEventListener<T>): this {
        return this.subscribeToEvent<K>("once", eventName, listener);
    }

    private subscribeToEvent<K>(type: "on" | "once", event: ProviderEvent, listener: (...args: any[]) => void) {
        const eventName = WebsocketProvider.getEventName(event);

        if (WebsocketProvider.events.network.has(eventName)) {
            this.handleOnNetworkEventSubscription(type, event, listener);
            return this;
        }

        super[type](eventName, listener);

        return this;
    }

    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): this {
        return this.unsubscribeFromEvent(eventName, listener);
    }

    private unsubscribeFromEvent(event: ProviderEvent, listener: (...args: any[]) => void) {
        const eventName = WebsocketProvider.getEventName(event);

        if (WebsocketProvider.events.network.has(eventName)) {
            void this.unsubscribeFromNetworkEvent(event, listener);
        }

        return super.off(eventName, listener);
    }

    async unsubscribeFromNetworkEvent(event: ProviderEvent, listener: (...args: any[]) => void) {
        const entry = this.subscriptions.entries().find((value) => value[1].listener === listener);
        const eventName = WebsocketProvider.getEventName(event);

        if (entry == null) {
            super.off(eventName, listener);
            return;
        }

        await this.unsubscribe(entry[0]);
        super.off(eventName, listener);
    }

    private static isWebsocketEmittedResponse(response: any): response is WebsocketEmittedResponse {
        return "params" in response && "subscription" in response.params && "result" in response.params;
    }

    private static getEventName(event: ProviderEvent): string | symbol {
        return typeof event === "object" ? event.event : event;
    }
}
