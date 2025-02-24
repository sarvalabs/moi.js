Logic
=====

The logic module in js-moi-sdk is a powerful component that simplifies the 
interaction with MOI logic objects. It provides a user-friendly interface 
for deploying, interacting with, and querying logic objects on the MOI network.

With the logic module, the logic manifests can be easily deployed using logic 
factory. This includes the ability to encode and deploy logics with builder 
arguments.

Once deployed, the module handles routine calls, interaction sending, and 
state queries, abstracting away complexities like parameter encoding, fuel and 
interaction signing.

Integration with the wallet and signer modules ensures secure interaction 
signing and authorization. Users can choose from different signers, such as 
wallet-based signers, or custom signers.

Usage
-----

The logic module is designed to be simple and intuitive. The following example
demonstrates how to deploy a logic object and interact with it.

Deploying a logic
*****************

.. code-block:: javascript

    import { readFile } from "node:fs/promises";

    import {
        getLogicDriver,
        HttpProvider,
        Wallet,
        type InteractionResponse,
        type LogicManifest,
    } from "js-moi-sdk";

    // Load the manifest from disk
    const loadManifestFromDisk = async (path: string) => {
        const content = await readFile(path, "utf-8");
        return JSON.parse(content) as LogicManifest;
    };

    // Load the manifest from disk. This is a helper function to load the manifest
    // in a json format
    //
    // In browser, loadManifestFromDisk can be replaced with a function that
    // fetches the manifest from a server or uploads the manifest from the
    // user's local file system
    const manifest = await loadManifestFromDisk("path/to/manifest.json");
    const wallet = await Wallet.fromMnemonic("my secret mnemonic", {
        provider: new HttpProvider("http://localhost:1600"),
    });

    // Gets logic driver uses the manifest to setup the endpoints and
    // utilities to encode and decode using the types defined in the manifest
    const driver = await getLogicDriver(manifest, wallet);

    // "Seed" is name of deployer endpoint in the manifest
    // The endpoint is defined as:
    //    Seed(symbol: String, amount: U64)
    //
    // To pass arguments to the endpoint, you can arguments in same sequence
    // as you pass to normal javascript function
    //
    // The following function return a promise of type `InteractionResponse`. Using the
    // interaction hash, confirmation of the interaction can be checked.
    // In this we doesn't need details of the interaction, so we can ignore the return value
    await driver.endpoint.Seed<InteractionResponse>("MY_TOKEN", 10000);

    // This is how you can get the logic id of the logic
    // Once the interaction is confirmed, you can get the logic id.
    //
    // If `getLogicId` returns a value, it means the interaction is confirmed
    // and the logic is deployed
    const logicId = await driver.getLogicId();

    // This is how you can get the unique logic id of the deployed logic
    console.log(logicId.toString());

    >> "0x...123456789"

Interacting with a logic
************************

In this example we will interact with the deployed logic which
will change the state of logic.

.. code-block:: javascript

    const logicId = new LogicId("0x...123456789");
    // In this example, logic is already deployed, so we can get the logic driver
    // using the logic id.
    //
    // This is how you can get the logic driver using the logic id, which query
    // the logic from the chain and setup the endpoints and utilities to encode
    // and decode using the types defined in the manifest.
    const driver = await getLogicDriver(logicId, wallet);

    const receiver = "0x...ffccab";
    // "Transfer" is name of transfer endpoint in the manifest that transfers tokens
    // to the receiver address, this endpoint is a mutating invoke endpoint, which
    // means it will change the state of the logic.
    // 
    // The endpoint is defined as:
    //    Transfer(amount: U64, receiver: Address)
    const ix = await driver.endpoint.Transfer<InteractionResponse>(10000, receiver);

    // Wait for the interaction to be confirmed
    const confirmation = await ix.wait();
    console.log(confirmation);

    >> { status: 1, ... } 

Below example demonstrates how to invoke a readable endpoint and get the result.

.. code-block:: javascript

    const logicId = new LogicId("0x...123456789");
    // In this example, logic is already deployed, so we can get the logic driver
    // using the logic id.
    //
    // This is how you can get the logic driver using the logic id, which query
    // the logic from the chain and setup the endpoints and utilities to encode
    // and decode using the types defined in the manifest.
    const driver = await getLogicDriver(logicId, wallet);

    const address = "0x...123456789";
    // "BalanceOf" is name of readable endpoint in the manifest that
    // returns the balance of the address
    // In case of "BalanceOf", the endpoint is defined as:
    //    BalanceOf(address: Address): (balance U64)
    //
    // Logic driver is smart enough to know determine the type of the endpoint
    // and return the value in the same type.
    const result = await driver.endpoint.BalanceOf<{ balance: number }>(address);

    console.log(result);

    >>> { balance: 10000 }

Accessing the state of a logic
******************************

In this example we will query the Persistent state of the logic.

.. code-block:: javascript

    const symbol = await driver
        .persistent<string>((accessor) => accessor.name("Symbol"));

    console.log(symbol);

    >> "MY_TOKEN"

In this example we will query the Ephemeral state of the logic.

.. code-block:: javascript

    const balance = await driver
        .ephemeral<number>((accessor) => accessor.name("Balance"));

    console.log(balance);

    >> 10000

Classes
-------

.. autoclass:: LogicDriver
    :members:

.. autoclass:: LogicDescriptor
    :members:

Functions
---------

.. autofunction:: getLogicDriver