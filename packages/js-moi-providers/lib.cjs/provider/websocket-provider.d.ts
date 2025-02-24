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
export declare class WebsocketProvider extends JsonRpcProvider {
    private static events;
    private readonly subscriptions;
    constructor(address: string, options?: WebsocketTransportOptions);
    getSubscriptions(): {
        id: string;
        event: {
            event: ProviderEvent;
            listener: BaseListener;
        };
    }[];
    close(): void;
    private handleOnNetworkEventSubscription;
    on<K, T extends ProviderEvent>(event: T, listener: ProviderEventListener<T>): this;
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