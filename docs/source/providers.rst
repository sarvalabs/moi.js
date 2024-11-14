=========
Providers
=========

--------------------------------------------------------------------------------

A Provider is a convenient interface for connecting to MOI nodes and retrieving 
data from the blockchain. With the providers module, developers can choose from 
various MOI providers such as Voyage to establish a connection with the MOI 
network. 

The Provider class abstracts away the complexities of interacting directly 
with the MOI network and provides a consistent and straightforward API for 
retrieving blockchain data. Whether it's querying account balances, interaction 
history, or logic information, the providers module simplifies the process of 
connecting to MOI nodes and fetching data, making it easier for developers to 
build applications that interact with the MOI network.

Types
-----
**InteractionInfo**

The ``InteractionInfo`` interface represents information about an interaction. It has the following properties:

* ``nonce`` - ``string``: The nonce value.
* ``type`` - ``string``: The type of the interaction.
* ``sender`` - ``string``: The sender of the interaction.
* ``receiver`` - ``string``: The receiver of the interaction.
* ``cost`` - ``string``: The cost of the interaction.
* ``fuel_price`` - ``string``: The fuel price for the interaction.
* ``fuel_limit`` - ``string``: The fuel limit for the interaction.
* ``input`` - ``string``: The input data for the interaction.
* ``hash`` - ``string``: The hash of the interaction.

**Content**

The ``Content`` interface represents ixpool information. It has the following properties:

* ``pending`` - ``Map<string, Map<number | bigint, InteractionInfo>>``: A map representing pending interactions in the ixpool.
* ``queued`` - ``Map<string, Map<number | bigint, InteractionInfo>>``: A map representing queued interactions in the ixpool.

**ContentFrom**

The ``ContentFrom`` interface represents ixpool information based on the sender. It has the following properties:

* ``pending`` - ``Map<number | bigint, InteractionInfo>``: A map representing pending interactions in the ixpool belonging to a specific sender.
* ``queued`` - ``Map<number | bigint, InteractionInfo>``: A map representing queued interactions in the ixpool belonging to a specific sender.

**Status**

The ``Status`` interface represents the status of ixpool. It has the following properties:

* ``pending`` - ``number | bigint``: The number or bigint value representing the number of pending interactions in ixpool.
* ``queued`` - ``number | bigint``: The number or bigint value representing the number of queued interactions in ixpool.

**WaitTime**

The ``WaitTime`` interface represents ixpool wait time information. It has the following properties:

* ``expired`` - ``boolean``: A boolean indicating if the wait time has expired.
* ``time`` - ``number | bigint``: The number or bigint value representing the wait time.

**Inspect**

The ``Inspect`` interface represents ixpool inspection information. It has the following properties:

* ``pending`` - ``Map<string, Map<string, string>>``: A map representing the pending interactions in ixpool.
* ``queued`` - ``Map<string, Map<string, string>>``: A map representing the queued interactions in ixpool.
* ``wait_time`` - ``Map<string, WaitTime>``: A map representing the wait times of each account in ixpool.

**Options**

The ``Options`` interface represents the **tesseract** options. It has the following properties:

* ``tesseract_number`` (optional) - ``number``: The Tesseract number.
* ``tesseract_hash`` (optional) - ``string``: The Tesseract hash.

**ContextInfo**

The ``ContextInfo`` interface represents information about the context. It has the following properties:

* ``behaviour_nodes`` - ``string[]``: An array of strings representing behavior nodes.
* ``random_nodes`` - ``string[]``: An array of strings representing random nodes.
* ``storage_nodes`` - ``string[]``: An array of strings representing storage nodes.

**TDUBase**

The ``TDUBase`` interface represents the base structure for TDU (Total Digital Utility). It has the following properties:

* ``asset_id`` - ``string``: The asset id.

**TDU**

The ``TDU`` interface extends ``TDUBase`` and represents a Total Digital Utility. It has the following additional property:

* ``amount`` - ``number | bigint``: The amount associated with the asset id.

**AccountState**

The ``AccountState`` interface represents the state of an account. It has the following properties:

* ``nonce`` - ``string``: The nonce value.
* ``acc_type`` - ``number``: The account type.
* ``balance`` - ``string``: The account balance.
* ``asset_approvals`` - ``string``: The asset approvals.
* ``context_hash`` - ``string``: The context hash.
* ``storage_root`` - ``string``: The storage root.
* ``logic_root`` - ``string``: The logic root.
* ``file_root`` - ``string``: The file root.

**AccountMetaInfo**

The ``AccountMetaInfo`` interface represents meta-information about an account. It has the following properties:

* ``type`` - ``number``: The account type.
* ``address`` - ``string``: The account address.
* ``height`` - ``string``: The account height.
* ``tesseract_hash`` - ``string``: The Tesseract hash.
* ``lattice_exists`` - ``boolean``: Indicates whether a lattice exists for the account.
* ``state_exists`` - ``boolean``: Indicates whether a state exists for the account.

**AccSyncStatus**

The ``AccSyncStatus`` interface encapsulates information about account synchronization. It includes the following properties:

* ``current_height`` - ``string``: The current tesseract height.
* ``expected_height`` - ``string``: The expected tesseract height.
* ``is_primary_sync_done`` - ``boolean``: Indicates whether the primary sync is completed.

**NodeSyncStatus**

The ``NodeSyncStatus`` interface encapsulates information about node synchronization. It includes the following properties:

* ``total_pending_accounts`` - ``string``: The total no of unsynced accounts.
* ``is_principal_sync_done`` - ``boolean``: Indicates whether the principal sync is completed.
* ``principal_sync_done_time`` - ``string``: The time at which principal sync got completed.
* ``is_initial_sync_done`` - ``boolean``: Indicates whether the initial sync is completed.

**SyncStatus**

The ``SyncStatus`` interface represents synchronization status information of an account and it's nodes. It has the following properties:

* ``acc_sync_status`` - ``AccSyncStatus``: The account sync information.
* ``node_sync_status`` - ``NodeSyncStatus | null``: The node sync information.

**InteractionRequest**

The ``InteractionRequest`` interface represents a signed interaction request. It has the following properties:

* ``ix_args`` - ``string``: The encoded interaction parameters.
* ``signature`` - ``string``: The signature for the interaction.

**InteractionResponse**

The ``InteractionResponse`` interface represents a response to an interaction. It has the following properties:

* ``hash`` - ``string``: The hash of the interaction.
* ``wait`` - ``function``: A function that returns a promise for the interaction receipt after waiting for a specified timeout.
* ``result`` - ``function``: A function that returns a promise for the result of the interaction after waiting for a specified timeout.

**InteractionCallResponse**

The ``InteractionCallResponse`` interface represents a response to an interaction. It has the following properties:

* ``receipt`` - ``InteractionReceipt``: The receipt of the interaction.
* ``result`` - ``function``: A function that returns the result of an interaction.

**StateHash**

The ``StateHash`` interface represents state hash information. It has the following properties:

* ``address`` - ``string``: The address associated with the state hash.
* ``hash`` - ``string``: The state hash value.

**ContextHash**

The ``ContextHash`` interface represents context hash information. It has the following properties:

* ``address`` - ``string``: The address associated with the context hash.
* ``hash`` - ``string``: The context hash value.

**ExecutionResult**

The ``ExecutionResult`` - ``AssetCreationResult``, ``AssetSupplyResult``, ``LogicDeployResult``, 
``LogicInvokeResult``, or ``null``: represents the detailed outcome of a operation execution. 
It can vary based on the specific type of operation.

**OperationResult**

The ``OperationResult`` interface represents the outcome of a processed operation, 
including its type, execution status, and resulting data.

* ``tx_type`` - ``string``: The type of operation.
* ``status`` - ``number``: The status code indicating the result of the operation.
* ``data`` - ``ExecutionResult``: The detailed operation execution result specific to the operation type or null

**InteractionReceipt**

The ``InteractionReceipt`` interface represents a receipt for an interaction. It has the following properties:

* ``ix_hash`` - ``string``: The hash of the interaction.
* ``status`` - ``number``: The status of the interaction.
* ``fuel_used`` - ``string``: The amount of fuel used for the interaction.
* ``participants`` - ``Participant[]``: The participants involved in the interaction.
* ``ix_operations`` - ``OperationResult[]``: A list of operation results.
* ``from`` - ``string``: The sender of the interaction.
* ``ix_index`` - ``string``: The index of the interaction.
* ``ts_hash`` - ``string``: The hash of the tesseract.

**AssetInfo**

The ``AssetInfo`` interface represents information about an asset. It has the following properties:

* ``symbol`` - ``string``: The symbol of the asset.
* ``operator`` - ``string``: The operator of the asset.
* ``supply`` - ``string``: The supply of the asset.
* ``dimension`` - ``string``: The dimension of the asset.
* ``standard`` - ``string``: The standard of the asset.
* ``is_logical`` - ``boolean``: Indicates whether the asset is logical.
* ``is_stateful`` - ``boolean``: Indicates whether the asset is stateful.
* ``logic_id`` (optional) - ``string``: The ID of the logic associated with the asset (if applicable).

**Registry**

The ``Registry`` interface represents registry information. It has the following properties:

* ``asset_id`` - ``string``: The ID of the asset in the registry.
* ``asset_info`` - ``AssetInfo``: Information about the asset in the registry.

**Filter**

The ``Filter`` interface represents a filter with a unique identifier. It has the following properties:

* ``id`` - ``string``: The unique identifier for the filter.

**FilterDeletionResult**

The ``FilterDeletionResult`` interface represents the result of a deletion operation. It has the following properties:

* ``status`` - ``boolean``: Indicates whether the deletion was successful (true) or not (false).

**NodeInfo**

The ``NodeInfo`` interface represents information about a node. It has the following property:

* ``krama_id`` - ``string``: The krama id associated with the node.

**ConnectionsInfo**

The ``ConnectionsInfo`` interface provides information about connections and active pub-sub topics. It consists of the following properties:

* ``connections`` - A list of connections, each containing:
    * ``peer_id`` - ``string``: The ID of the peer associated with the connection.
    * ``streams`` - A list of streams, each containing:
        * ``protocol`` - ``string``: The protocol of the stream.
        * ``direction`` - ``number``: The direction of the stream.

* ``inbound_conn_count`` - ``number``: The count of inbound connections.
* ``outbound_conn_count`` - ``number``: The count of outbound connections.
* ``active_pub_sub_topics`` - A dictionary where the keys are topic strings and the values are numbers representing the count of active connections for each topic.

**ParticipantCreatePayload**

The ``ParticipantCreatePayload`` interface represents a payload for creating an participant. It has the following properties:

* ``address`` - ``string``: The participant's address to register on the network.
* ``amount`` - ``number | bigint``: The initial deposit amount.

**AssetActionPayload**

The ``AssetActionPayload`` interface represents a payload for transferring/approving/revoking an asset. It has the following properties:

* ``benefactor`` - ``string``: The address that authorized access to his asset funds.
* ``beneficiary`` - ``string``: The recipient address for the transfer/approve/revoke operation.
* ``asset_id`` - ``string``: The ID of the asset for which to transfer/approve/revoke.
* ``amount`` - ``number | bigint``: The amount for transfer/approve/revoke.

**AssetCreatePayload**

The ``AssetCreatePayload`` interface represents a payload for creating an asset. It has the following properties:

* ``symbol`` - ``string``: The symbol of the asset.
* ``supply`` - ``number | bigint``: The supply of the asset.
* ``standard`` - ``AssetStandard``: The asset standard (optional).
* ``dimension`` - ``number``: The dimension of the asset (optional).
* ``is_stateful`` - ``boolean``: Indicates whether the asset is stateful (optional).
* ``is_logical`` - ``boolean``: Indicates whether the asset is logical (optional).
* ``logic_payload`` - ``LogicPayload``: The payload for the associated logic (optional).

**AssetSupplyPayload**

The ``AssetSupplyPayload`` interface represents a payload for minting or burning an asset. It has the following properties:

* ``asset_id`` - ``string``: The ID of the asset.
* ``amount`` - ``number | bigint``: The amount to mint or burn.

**LogicPayload**

The ``LogicPayload`` interface represents a payload for logic deployment or invokation. It has the following properties:

* ``logic_id`` - ``string``: The ID of the logic (optional).
* ``callsite`` - ``string``: The callsite for the logic execution.
* ``calldata`` - ``Uint8Array``: The calldata for the logic execution.
* ``manifest`` - ``Uint8Array``: The encoded manifest to deploy (optional).

**OperationPayload**

The ``OperationPayload`` type represents a payload for an operation. It can be one of the following types: ``ParticipantCreatePayload``, 
``AssetActionPayload``, ``AssetCreatePayload``, ``AssetSupplyPayload``, or ``LogicPayload``.

**IxFund**

The ``IxFund`` type represents the asset and the amount required for validating the interaction before processing.

* ``asset_id`` - ``string``: The unique identifier of the asset.
* ``amount`` - ``number | bigint``: The total required amount for the interaction, 
specified as either a ``number`` or a ``bigint``.

**IxOperation**

The ``IxOperation`` type represents an individual operation that is part of a larger interaction.

* ``type`` - ``string``: The type of the operation.
* ``payload`` - ``OperationPayload``: The specific payload corresponding to the operation.

**IxParticipant**

The ``IxParticipant`` type represents a participant involved in the interaction and their corresponding lock type.

* ``address`` - ``string``: The address of the participant involved in the interaction.
* ``lock_type`` - ``number``: The type of lock to acquire while processing the interaction.

**InteractionObject**

The ``InteractionObject`` interface represents an interaction object. It has the following properties:

* ``sender`` - ``string``: The address of the participant initiating the interaction (optional).
* ``payer`` - ``string``: The address of the participant responsible for covering the interaction's fuel costs. (optional).
* ``nonce`` - ``number | bigint``: A unique value used to ensure the interaction's uniqueness (optional).
* ``funds`` - ``IxFund``: The list of asset funds required for the interaction (optional).
* ``ix_operations`` - ``IxOperation``: The list of ix_operations that are part of the interaction and are to be executed.
* ``pariticipants`` - ``IxParticipant``: The list of participants involved in the interaction, along with their respective lock types (optional).
* ``fuel_price`` - ``number | bigint``: The price per unit of fuel for executing the interaction.
* ``fuel_limit`` - ``number | bigint``: The maximum amount of fuel that can be consumed during the processing of the interaction.

**CallorEstimateIxObject**

The ``CallorEstimateIxObject`` interface extends ``InteractionObject`` and represents an interaction object. It has the following properties:

* ``nonce`` - ``number | bigint``: The nonce value.
* ``sender`` - ``string``: The sender of the interaction.

**WebsocketConnection**

The ``WebsocketConnection`` interface represents options for a websocket provider. It has the following properties:

* ``protocols`` - ``object``: The protocols for the websocket connection (optional).
* ``headers`` - ``object``: The headers for the websocket connection (optional).
* ``requestOptions`` - ``object``: The request options for the websocket connection (optional).
* ``clientConfig`` - ``object``: Configuration options for the websocket client (optional).
* ``reconnect`` - ``object``: Configuration options for websocket reconnection (optional).
* ``timeout`` - ``number``: The timeout duration in milliseconds for the websocket connection (optional).


.. note::

   **Important:** Please note that the current version of js-moi-sdk only supports the `reconnectOptions` property of `WebsocketProviderOptions`. Other properties may not be available or functional in the current version.


Abstract Provider
-----------------
AbstractProvider is an abstract class that defines the common interface and 
methods for all providers. It serves as a blueprint for other provider classes, 
enforcing consistent behavior and standardizing the processing of input 
arguments, output results, and event tracking within an environment where 
network consistency is achieved gradually.

Base Provider
-------------

A BaseProvider is a subclass of AbstractProvider and acts as a fundamental 
building block for other subclasses. The BaseProvider class promotes code 
reusability and modularity by defining common methods and attributes. It 
facilitates the development of provider classes with a cohesive and 
consistent approach, reducing redundancy and enhancing maintainability.

Account Methods
~~~~~~~~~~~~~~~

.. autofunction:: getBalance

.. autofunction:: getContextInfo

.. autofunction:: getTDU

.. autofunction:: getInteractionByHash

.. autofunction:: getInteractionByTesseract

.. autofunction:: getInteractionCount

.. autofunction:: getPendingInteractionCount

.. autofunction:: getAccountState

.. autofunction:: getAccountMetaInfo

.. autofunction:: getContentFrom

.. autofunction:: getWaitTime

.. autofunction:: getTesseract

.. autofunction:: getLogicIds

.. autofunction:: getRegistry

.. autofunction:: getSyncStatus

Execution Methods
~~~~~~~~~~~~~~~~~

.. autofunction:: BaseProvider#call

.. autofunction:: BaseProvider#estimateFuel

.. autofunction:: BaseProvider#sendInteraction

Query Methods
~~~~~~~~~~~~~

.. autofunction:: getAssetInfoByAssetID

.. autofunction:: getLogs

.. autofunction:: getInteractionReceipt

.. autofunction:: getStorageAt

.. autofunction:: getLogicManifest

.. autofunction:: getContent

.. autofunction:: getStatus

.. autofunction:: getInspect

.. autofunction:: getPeers

.. autofunction:: BaseProvider#getVersion

.. autofunction:: getNodeInfo

.. autofunction:: getNewTesseractFilter

.. autofunction:: getNewTesseractsByAccountFilter

.. autofunction:: getPendingInteractionFilter

.. autofunction:: getLogsFilter

.. autofunction:: getFilterChanges

.. autofunction:: removeFilter

Event Methods
~~~~~~~~~~~~~

.. autofunction:: on

.. autofunction:: off

.. autofunction:: once

.. autofunction:: listeners

.. autofunction:: listenerCount

.. autofunction:: removeAllListeners

Json Rpc Provider
-----------------
The JsonRpcProvider is a subclass of ``BaseProvider`` it facilitates interaction 
with MOI nodes using the JSON-RPC protocol. It offers a flexible interface to 
send HTTP (or HTTPS) requests and retrieve data from the blockchain.

.. code-block:: javascript

    // Example
    const provider = new JsonRpcProvider("http://localhost:1600");

Usage
~~~~~

Tesseract
^^^^^^^^^

.. code-block:: javascript

    // Example
    const address  = "0x45b9906e65c9bdf4703918aa2c78fe139ba8e32c5e0dcda585dac4c584651f08";
    const options = { 
        tesseract_number: 1 
    }
    const tesseract = await provider.getTesseract(address, true, options);
    console.log(tesseract)

    // Output:
    /*
        {
            "participants": [
                {
                    "address": "0x45b9906e65c9bdf4703918aa2c78fe139ba8e32c5e0dcda585dac4c584651f08",
                    "height": "0x2",
                    ...
                },
                {
                    "address": "0x96c93a80bc13e4864b485937d5aca52a2e61135b03e4918c58cc2bcc1b9e7a6b",
                    "height": "0x0",
                    ...
                },
                {
                    "address": "0xa6ba9853f131679d00da0f033516a2efe9cd53c3d54e1f9a6e60e9077e9f9384",
                    "height": "0x2",
                    ...
                }
            ],
            "interactions_hash": "0x0b702b5451387ab6611fe790e81e235f7b67e88ed010a5687e6a0befbea211a7",
            "receipts_hash": "0xa777c6da47a2e2c47ff03fd8e8ba98f56dbda6f889112d6cd4c516c9b5ba54f5",
            ...
            "consensus_info": {
                "evidence_hash": "0xf02307c9cc0428a59025ab4d61add5a9c5808f7de59ce16070f05117ab88329d",
                ...
            },
            "seal": "0x0460aed71dc4bc5cbd827791c342af7de2ed23ec6c44accc3a3fc37aa419c11ae673efed217f7c8e3df602fc7798bb989c10096615983ed2ebeebf83d62c28da2c7f4bbbe5623b1d704e752ab7ae9516b49c5171bf6febbb5d04af5fcadd0694e880",
            "hash": "0x9230bc7fa374304d5137fe8528b57b4b5c36763f867e2424cbc2114d07499035",
            "ixns": [
                {
                    "nonce": "0x1",
                    "sender": "0x45b9906e65c9bdf4703918aa2c78fe139ba8e32c5e0dcda585dac4c584651f08",
                    "payer": "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "fuel_price": "0x1",
                    "fuel_limit": "0xc8",
                    "ix_operations": [
                        {
                            "type": 3,
                            "payload": {
                                "symbol": "TOKYO",
                                "supply": "0xc350",
                                ...
                            }
                        }
                    ],
                    ...
                }
            ]
        }
    */

Context Info
^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b"
    const contextInfo = await provider.getContextInfo(address)
    console.log(contextInfo)

    // Output
    /*
        {
            "behaviour_nodes": [
                "3Wywv4WykAqs6mH1YAWNHKYFw77tuF4iFkcQPxyFgzT9XEPPEkaK.16Uiu2HAkzhT4eoJoQWz9P7S65j6F6dSHEVGN925AXg5kqhisgSai",
                "3Wy3MY7saXna1ypZMYVooUPD9k3hU7vWXQvTRFdpabmSC7pr8om9.16Uiu2HAm3hy8wAw9hjuxXqGGmnpQQrU7ouZWwJuDAQJbesvg49hX"
            ],
            "random_nodes": [],
            "storage_nodes": []
        }
    */

WebSocket Provider
------------------
The WebSocketProvider is a subclass of ``BaseProvider`` that enables interaction 
with MOI nodes using the WebSocket protocol. It provides a flexible interface 
for sending and receiving data from the blockchain in real-time.

Using WebSocket, the provider establishes a persistent connection with the MOI 
node, allowing for efficient and continuous communication. This is particularly 
useful for applications requiring real-time updates or streaming data from 
the blockchain.

The WebSocketProvider offers similar functionality as the JsonRpcProvider but 
operates over WebSocket instead of HTTP or HTTPS. It allows for subscribing to 
specific events or filters, receiving instant notifications when relevant data 
changes on the blockchain.

The MOI protocol has incorporated support for invoking JSON-RPC methods over a 
WebSocket connection, facilitating real-time interaction with the blockchain.

.. code-block:: javascript

    // Example
    const provider = new WebsocketProvider("wss://localhost:8080", {
        timeout: 20000,
        reconnect: {
            delay: 1000,
            maxAttempts: 5000
        }
    });

WebSocket Events
~~~~~~~~~~~~~~~~
The event's listed below are related to the WebSocketProvider itself and 
its connection status and operation. These are not specific to blockchain data.

``WebSocketEvent.Connect`` - This event is triggered when the WebSocketProvider successfully 
establishes a connection with the MOI node. It indicates that the WebSocket 
connection has been established and is ready for sending and receiving data.

``WebSocketEvent.Reconnect`` - This event occurs when the WebSocketProvider attempts to 
reconnect to the MOI node after a disconnection.

``WebSocketEvent.Close`` - This event is emitted when the WebSocket connection is closed 
intentionally or due to an error. It provides information about the reason for 
the closure, such as a manual disconnection or a network failure.

``WebSocketEvent.Error`` - This event is emitted when an error occurs during the 
WebSocketProvider's operation. It indicates that something unexpected or 
erroneous has happened, such as a network error, an invalid response from the 
MOI node, or any other unforeseen issue.

Protocol Events
~~~~~~~~~~~~~~~
The event's listed below are specific to blockchain data.

``WebSocketEvent.NewTesseracts`` - This event is triggered when a new tesseract is mined on 
the blockchain. It provides information about the tesseract, such as its 
height, hash, timestamp, and other relevant data.

``WebSocketEvent.NewTesseractsByAccount`` - This event is triggered when a new tesseract belonging to 
the given address is mined on the blockchain. It provides information about the 
tesseract.

``WebSocketEvent.NewPendingInteractions`` - This event is emitted when a new interaction is added to
interaction pool. It provides an interaction hash.

``WebSocketEvent.NewLogs`` - This event is triggered when new logs are added for a given address and topics.

Usage
~~~~~

Subscribing to all tesseracts
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const handleTesseracts = async (tesseract) => {
        console.log("New tesseract finalized", tesseract);
    };

    provider.on(WebSocketEvent.NewTesseracts, handleTesseracts);

    provider.on(WebSocketEvent.Error, (err) => {
        console.log("WebSocket connection error:", err);
    });

    provider.on(WebSocketEvent.Close, (info) => {
        console.log("WebSocket connection closed: ", info);

        // Remove "tesseracts" event listener
        provider.off(WebSocketEvent.NewTesseracts, handleTesseracts);
    });

Subscribing to tesseracts by address
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const ws = new WebsocketProvider("ws://localhost:8080");

    ws.on({ event: WebSocketEvent.NewTesseractsByAccount, params: { address: "0x...abc" } }, (tesseract) => {
        console.log(tesseract);
    });

Subscribing to new logs
^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    provider.on({ event: WebSocketEvent.NewLog, params: { address: "0x..abc", height: [-1, -1], topics: [] } }, (log) => {
        console.log("New log", log);
    });

Subscribing to pending interactions
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    provider.on(WebSocketEvent.NewPendingInteractions, (log) => {
        console.log("New log", log);
    });

Websocket enabled JSON-RPC communication
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0x...abc";
    const tdu = await provider.getTDU(address)
    console.log(tdu)

    // Output
    /*
        [
            {
                "asset_id": "0x...xyz",
                "amount": "0xF4161"
            }
        ]
    */

Voyage Provider
---------------
The **VoyageProvider** is a subclass of ``BaseProvider`` it allows users to 
connect their applications to the MOI network using the voyage service.
Voyage is a reliable and scalable infrastructure provider for MOI, offering a 
convenient way to access the MOI blockchain without the need to run a full node. 
It acts as a middle layer between applications and the blockchain, handling the 
complexities of node management, synchronization, and data retrieval.

.. code-block:: javascript

    // Example
    const provider = new VoyageProvider("babylon");

Usage
~~~~~

Account State
^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const address = "0xf350520ebca8c09efa19f2ed13012ceb70b2e710241748f4ac11bd4a9b43949b";
    const options = {
        tesseract_number: 1
    }
    const account = await provider.getAccountState(address, options)
    console.log(account)

    // Output
    /*
        {
            "acc_type": 2,
            "asset_approvals": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "asset_registry": "0x6800fedfcca2fa63d9b404d09c2b206476930468013e6150178d7f37aad120ac",
            "balance": "0x48b8dbcc3d7979c47f6272010ed74f59101b2bfe9d261d6797772dacd37f4400",
            "context_hash": "0xa1058908a4db1594632be49790b24211cd4920a0f27b3d2b876808f910b3e320",
            "file_root": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "logic_root": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "nonce": "0x1",
            "storage_root": "0x0000000000000000000000000000000000000000000000000000000000000000"
        }
    */

Interaction By Hash
^^^^^^^^^^^^^^^^^^^

.. code-block:: javascript

    // Example
    const ixHash = "0x836dd0fd460f2fe3e6690d2552399e2ab9e9022819586b0392bc214841ff6a3a";
    const interaction = await provider.getInteractionByHash(ixHash)
    console.log(interaction)

    // Output
    /*
        {
            "nonce": "0x1",
            "sender": "0x45b9906e65c9bdf4703918aa2c78fe139ba8e32c5e0dcda585dac4c584651f08",
            "payer": "0x0000000000000000000000000000000000000000000000000000000000000000",
            "fuel_price": "0x1",
            "fuel_limit": "0xc8",
            "ix_operations": [
                {
                    "type": 3,
                    "payload": {
                        "symbol": "TOKYO",
                        "supply": "0xc350",
                        ...
                    }
                }
            ],
            "hash": "0x836dd0fd460f2fe3e6690d2552399e2ab9e9022819586b0392bc214841ff6a3a",
            "signature": "0x01473045022100bebcfc9653585af851017c5dd7ad590a29a180eee5c25f4c321049d7bef35c300220520f56228b2f93098adc54aab3647fa1951ec5404bed3bb79add72eaa199761e03",
            "ts_hash": "0x9230bc7fa374304d5137fe8528b57b4b5c36763f867e2424cbc2114d07499035",
            "participants": [
                {
                    "address": "0x45b9906e65c9bdf4703918aa2c78fe139ba8e32c5e0dcda585dac4c584651f08",
                    "height": "0x2",
                    ...
                },
                {
                    "address": "0x96c93a80bc13e4864b485937d5aca52a2e61135b03e4918c58cc2bcc1b9e7a6b",
                    "height": "0x0",
                    ...
                },
                {
                    "address": "0xa6ba9853f131679d00da0f033516a2efe9cd53c3d54e1f9a6e60e9077e9f9384",
                    "height": "0x2",
                    ...
                }
            ],
            "ix_index": "0x0"
        }
    */
