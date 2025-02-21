import type EventEmitter from "events";
import type { JsonRpcResponse } from "./json-rpc";

/**
 * Transport represents a way to send and receive JSON-RPC messages.
 */
export interface Transport extends EventEmitter {
    /**
     * Sends a JSON-RPC request to the client.
     *
     * @param method The method to call.
     * @param params The parameters to pass to the method.
     * @returns The JSON-RPC response.
     */
    request<TResult = unknown>(method: string, params: unknown[]): Promise<JsonRpcResponse<TResult>>;
}
