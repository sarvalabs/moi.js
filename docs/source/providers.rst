Providers
=========

A Provider is a convenient interface for connecting to MOI nodes
and retrieving data from the blockchain. With the providers module,
developers can choose from various MOI providers such as Voyage to
establish a connection with the MOI network.

The Provider class abstracts away the complexities of interacting
directly with the MOI network and provides a consistent and
straightforward API for retrieving blockchain data. Whether it's
querying account balances, interaction history, or logic
information, the providers module simplifies the process
of connecting to MOI nodes and fetching data, making it easier
for developers to build applications that interact with the MOI
network.

Provider
--------

Classes
*******

.. js:autoclass:: JsonRpcProvider
    :members:

.. js:autoclass:: HttpProvider
    :members:

.. js:autoclass:: WebsocketProvider
    :members:

.. js:autoclass:: VoyageProvider
    :members:

Events
******

Provider extends from NodeJS `EventEmitter <https://nodejs.org/api/events.html>`_
and events can be either either strings or objects.

Callbacks can be registered for the following events:


- ``WebsocketEvent.Error``: Emitted when an error occurs in the WebSocket connection.
- ``WebsocketEvent.Open``: Emitted when the WebSocket connection is opened.
- ``WebsocketEvent.Close``: Emitted when the WebSocket connection is closed.
- ``WebsocketEvent.Message``: Emitted when a message is received from the WebSocket connection.
- ``WebsocketEvent.Debug``: Emitted when a provider emits debug information. All provider can emit this event for debugging purposes.
- ``WebsocketEvent.NewPendingInteractions``: Emitted when a new pending interaction is received from connected MOI node.
- ``WebsocketEvent.NewTesseracts``: Emitted when a new tesseract is received from connected MOI node.
- ``WebsocketEvent.NewTesseractsByAccount``: Emitted when a new tesseract is received for a specific account from connected MOI node. Developes have to pass the account address.
- ``WebsocketEvent.NewLogs``: Emitted when a new log is emitted any logic.

**Example**

.. code-block:: javascript

    import { WebsocketEvent, WebsocketProvider } from "js-moi-sdk";

    const url = "ws://localhost:1600/ws";
    const provider = new WebsocketProvider(url);

    const participant = "0x1ce...af3";

    // Emitted an event when the connection is established
    provider.on(WebsocketEvent.Open, () => {
        console.log("Connected to", url);
    });

    // Emitted an event when the provider emits a debug message
    provider.on(WebsocketEvent.Debug, (info) => {
        console.log("DEBUG:", info);
    });

    // Emitted an event when the connection is closed
    provider.on(WebsocketEvent.Close, () => {
        console.log("Connection closed");
    });

    // Emitted an event when an error occurs
    provider.on(WebsocketEvent.Error, (error) => {
        console.error("ERROR:", error);
    });

    // Emitted when new interaction is created on the network
    provider.on(WebsocketEvent.NewPendingInteractions, (hash) => {
        console.log("New pending interaction hash:", hash);
    });

    // Emitted when new tesseract is created on the network
    provider.on(WebsocketEvent.NewTesseracts, (tesseract) => {
        console.log("New tesseract:", tesseract);
    });

    // Emitted when new tesseract is created for a specific identifier
    provider.on(
        {
            event: WebsocketEvent.NewTesseractsByAccount,
            params: [{ address: participant }],
        },
        (tesseract) => {
            console.log("New tesseract for account", participant, ":", tesseract);
        }
    );

    // Emitted when new logs are emitted by the logic on a network
    provider.on(
        {
            event: WebsocketEvent.NewLogs,
            params: [
                {
                    address: participant,
                    start_height: 0,
                    end_height: 100,
                    topics: [],
                },
            ],
        },
        (logs) => {
            console.log("Logs for account", participant, ":", logs);
        }
    );

InteractionResponse
*******************

.. js:autoclass:: InteractionResponse
    :members:

Transport
---------

Transport are the underlying communication channels used by the
Provider to connect to MOI nodes. The Transport class defines
the common interface for establishing connections and sending
requests to MOI nodes. By abstracting the communication layer,
the Transport class enables the Provider to interact with
different types of MOI nodes, provides a consistent way to
communicate with the network.

Developers can create their own custom transports by extending
the ``Transport`` interface and implementing the required methods.

**For example**

Below is an example of a custom transport using 
`axios <https://www.npmjs.com/package/axios>`_ to connect to a MOI 
json-rpc server.

.. code-block:: javascript

    import axios from "axios";
    import type { JsonRpcRequest, JsonRpcResponse, Transport } from "js-moi-sdk";

    export class AxiosTransport implements Transport {
        private readonly url = "https://voyage-rpc.moi.technology/babylon/";

        async request<TResult = unknown>(request: JsonRpcRequest): Promise<JsonRpcResponse<TResult>> {
            const response = await axios.post(this.url, request, {
                timeout: 30000,
            });

            return response.data as JsonRpcResponse<TResult>;
        }
    }


This custom transport can be plugged into the Provider to perform
interactions with the MOI network.

.. code-block:: javascript

    import { JsonRpcProvider } from "js-moi-sdk";
    import { AxiosTransport } from "./axios-transport";

    const provider = new JsonRpcProvider(new AxiosTransport());
    const info = await provider.getNetworkInfo()
    
    console.log(info);

    >> { chain_id: 1, version: "v0.12.0" }

Currently, the `js-moi-provider` package provides built-in HTTP and WebSocket
transports for connecting to MOI nodes. Developers can use these transports
to establish connections with the MOI network and retrieve data from the network.

Classes
*******

.. js:autoclass:: HttpTransport
    :members:

.. js:autoclass:: WebsocketTransport
    :members: