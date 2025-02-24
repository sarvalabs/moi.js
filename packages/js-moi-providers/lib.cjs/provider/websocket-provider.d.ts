import { type Hex, type Tesseract } from "js-moi-utils";
import { type WebsocketTransportOptions } from "../transport/ws-transport";
import { JsonRpcProvider } from "./json-rpc-provider";
export declare enum WebsocketEvent {
    Error = "error",
    Open = "open",
    Debug = "debug",
    Close = "close",
    Reconnect = "reconnect",
    Message = "message",
    NewPendingInteractions = "newPendingInteractions",
    NewTesseracts = "newTesseracts",
    NewTesseractsByAccount = "newTesseractsByAccount",
    NewLogs = "newLogs"
}
type BaseListener = (...args: any[]) => void;
type DebugParam = {
    action: string;
    payload: unknown;
};
export type ProviderEvent = WebsocketEvent.Close | WebsocketEvent.Error | WebsocketEvent.Open | WebsocketEvent.Reconnect | WebsocketEvent.Message | WebsocketEvent.NewPendingInteractions | WebsocketEvent.NewTesseracts | {
    event: WebsocketEvent.NewTesseractsByAccount;
    params: [{
        address: Hex;
    }];
} | {
    event: WebsocketEvent.NewLogs;
    params: [{
        start_height: number;
        end_height: number;
        address: Hex;
        topics: any[];
    }];
} | string | symbol;
type WebsocketEventListener<TEvent extends WebsocketEvent> = TEvent extends WebsocketEvent.NewPendingInteractions ? (hash: string) => void : TEvent extends WebsocketEvent.NewTesseracts | WebsocketEvent.NewTesseractsByAccount ? (tesseracts: Tesseract) => void : TEvent extends WebsocketEvent.Reconnect ? (reconnects: number) => void : TEvent extends WebsocketEvent.Error ? (error: Error) => void : TEvent extends WebsocketEvent.Message ? (message: any) => void : TEvent extends WebsocketEvent.Debug ? (data: DebugParam) => void : TEvent extends WebsocketEvent.Open | WebsocketEvent.Close ? () => void : BaseListener;
type ProviderEventListener<TEvent extends ProviderEvent> = TEvent extends string ? TEvent extends WebsocketEvent ? WebsocketEventListener<TEvent> : BaseListener : TEvent extends symbol ? BaseListener : TEvent extends {
    event: infer TEventType;
} ? TEventType extends WebsocketEvent ? WebsocketEventListener<TEventType> : never : never;
/**
 * WebsocketProvider is a provider that connects to a network via a websocket connection.
 *
 * It extends the JsonRpcProvider and adds the ability to subscribe to network events.
 */
export declare class WebsocketProvider extends JsonRpcProvider {
    private static events;
    private readonly subscriptions;
    constructor(address: string, options?: WebsocketTransportOptions);
    /**
     * Retrieves the current list of subscriptions.
     *
     * @returns An array of subscription objects, each containing an `id` and an `event`.
     */
    getSubscriptions(): {
        id: string;
        event: {
            event: ProviderEvent;
            listener: BaseListener;
        };
    }[];
    /**
     * Closes the WebSocket connection if the transport is an instance of WebsocketTransport.
     * This method ensures that the WebSocket connection is properly terminated.
     *
     * @returns {void}
     */
    close(): void;
    private handleOnNetworkEventSubscription;
    /**
     * Registers an event listener for a specified provider event.
     *
     * @param event - The event to listen for.
     * @param listener - The callback function to be invoked when the event occurs.
     * @returns The current instance to allow method chaining.
     */
    on<K, T extends ProviderEvent>(event: T, listener: ProviderEventListener<T>): this;
    /**
     * Registers an event listener for a specified provider event that will only be called once.
     *
     * @param event - The event to listen for.
     * @param listener - The callback function to be invoked when the event occurs.
     * @returns The current instance to allow method chaining.
     */
    once<K, T extends ProviderEvent>(eventName: T, listener: ProviderEventListener<T>): this;
    private subscribeToEvent;
    off<K>(eventName: string | symbol, listener: (...args: any[]) => void): this;
    private unsubscribeFromEvent;
    unsubscribeFromNetworkEvent(event: ProviderEvent, listener: (...args: any[]) => void): Promise<void>;
    private static isWebsocketEmittedResponse;
    private static getEventName;
}
export {};
//# sourceMappingURL=websocket-provider.d.ts.map