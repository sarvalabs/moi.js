Getting Started
===============

Kickstart your journey with js-moi-sdk by installing and importing it. Unleash its 
potential through comprehensive documentation and resources to supercharge 
your application development.

It consists of several modules that provide a wide range of functionalities
to interact with the MOI Protocol and its ecosystem. These modules include

- `js-moi-bip39 <https://www.npmjs.com/package/js-moi-bip39>`_: This package offers the features necessary for generating and handling mnemonic phrases in accordance with the BIP39 standard.
- `js-moi-constants <https://www.npmjs.com/package/js-moi-constants>`_: This package includes common constants used within the js-moi-sdk ecosystem. These constants provide predefined values for various aspects of MOI, making it easier to work with the protocol.
- `js-moi-hdnode <https://www.npmjs.com/package/js-moi-hdnode>`_: This package represents a Hierarchical Deterministic (HD) Node for cryptographic key generation and derivation. It allows you to generate and manage keys within a hierarchical structure, providing enhanced security and flexibility.
- `js-moi-signer <https://www.npmjs.com/package/js-moi-signer>`_: This package represents an MOI account with the ability to sign interactions and messages for cryptographic proof. It provides the necessary tools to sign interactions securely and authenticate interactions on the MOI network.
- `js-moi-provider <https://www.npmjs.com/package/js-moi-provider>`_: This package enables you to connect to MOI nodes and retrieve blockchain data, such as account balances and interaction history. It provides an interface for interacting with the MOI protocol and fetching information from the network.
- `js-moi-wallet <https://www.npmjs.com/package/js-moi-wallet>`_: This package represents a Hierarchical Deterministic Wallet capable of signing interactions and managing accounts. It provides a convenient interface for managing multiple accounts, generating keys, and securely signing interactions.
- `js-moi-logic <https://www.npmjs.com/package/js-moi-logic>`_: This package simplifies interaction with MOI logic objects by offering deployment, interaction, and querying capabilities. It provides a higher-level interface for working with MOI logic, allowing you to deploy logic objects, send interactions, and retrieve results.
- `js-moi-manifest <https://www.npmjs.com/package/js-moi-manifest>`_: This package encodes and decodes data according to the MOI Manifest specification, facilitating interaction with logic objects. It simplifies the process of encoding and decoding data structures, making it easier to work with MOI logic objects.
- `js-moi-identifiers <https://www.npmjs.com/package/js-moi-identifiers>`_: PThis package provides utils for working with various identifiers used in the MOI ecosystem. It offers functions for getting and setting identifiers, as well as validating and formatting them according to the MOI standard.
- `js-moi-utils <https://www.npmjs.com/package/js-moi-utils>`_: This package offers a comprehensive set of tools and functions to enhance development with MOI. It provides utility functions that simplify common tasks, making your development experience smoother and more efficient.

All of these modules come pre-installed with ``js-moi-sdk``. However, if you
prefer, you can also install them individually based on your needs.

Installing
------------
Install the latest `release <https://www.npmjs.com/package/js-moi-sdk>`_ 
using the following command:

**Using NPM**

.. code-block:: shell

    npm install js-moi-sdk

**Using Yarn**

.. code-block:: shell

    yarn add js-moi-sdk

**Using PNPM**

.. code-block:: shell

    pnpm add js-moi-sdk

Importing
-----------
If you are using CommonJS module, you can use ``require`` to import from `js-moi-sdk`.

.. code-block:: javascript

   const { Wallet, HttpProvider } = require("js-moi-sdk")

If you are using EcmaScript module or TypeScript, you can use the import statement.

.. code-block:: javascript

   import { Wallet, HttpProvider } from "js-moi-sdk"

Key Concepts
------------

Before you begin, understanding the core concepts of ``js-moi-sdk`` is essential.
Familiarizing yourself with these fundamentals will help you use the package
efficiently in your application development.

**Tesseract**

It act as the fundamental unit of value space in MOI, Tesseract holds the 
outcome of an interaction's execution. It also holds various information like 
the latest state of the participant, interaction payloads, consensus data, 
and so on.

**Interaction**

An Interaction can be created, signed, and send to the MOI network. This library 
provides a convenient interface for constructing interactions by specifying 
essential details such as the recipient address, interaction type, fule price,
fuel limit, and so on.

**Operation**

An Operation is a discrete action encapsulated within an Interaction. It is 
responsible for executing specific actions, such as asset creation, transfer, 
minting, burning, logic deployment, invocation, or enlist. Each operation 
includes key details like the type of action being performed and the associated 
payload. Operations are processed as part of an interaction, and their 
execution directly impacts the state of participants and contributes to 
changes in the overall network state.

**Asset**

An Asset in MOI is simply an exchangeable digital asset that is managed and 
recognized natively by the MOI Protocol. Unlike other blockchain protocols, 
all Assets in MOI are directly owned and managed by participants in their 
accounts.

Retrieving the balances of a participant will return a composite object with 
all Assets held in that account indexed by their Asset ID, which is a 
unique identifier for the Asset.

**Logic**

Logic is a program stored on the blockchain that operates based on predefined 
rules and conditions, eliminating the need for intermediaries and ensuring 
transparency, security, and immutability of interactions.

Logic is typically used to facilitate and automate various types of digital 
interactions, ranging from financial interactions to supply chain management and 
decentralized applications (DApps).

**Manifest**

Manifest is a specification that defines the structure of logic object which 
includes routines, classes, methods, and state. It facilitates seamless 
interaction, accurate encoding and decoding of data for invoking routines.

**Receipt**

After an interaction is executed on the network, a receipt is generated and 
stored on the blockchain as a record of that interaction's execution. Receipts 
contains detailed information about the interaction's execution, including 
whether it was successful, the fuel used, and other relevant data.

**Provider**

A Provider provides a convenient interface for connecting to MOI nodes and 
retrieving data from the blockchain. These providers serve as gateways to the 
MOI network, enabling users to access data like account balances, interaction 
history, logic information, and more.

**Signer**

A Signer acts as a representation of an MOI account and possesses the ability 
to sign interactions and messages. It abstracts away the low-level 
cryptographic operations required for signing and allows users to interact 
securely with the MOI network.

In addition to interaction signing, the signer module supports message signing, 
which is widely used for identity verification and authentication purposes in 
decentralized applications. Developers can utilize the signer's capabilities to 
sign and verify arbitrary messages, providing cryptographic proof of the 
message's origin and integrity.

**Provider**

A provider is a convenient interface for connecting to MOI network.
It allows developers to execute JSON-RPC calls to the MOI network and retrieve
data from the network.
