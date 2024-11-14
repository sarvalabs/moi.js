===============
Getting Started
===============

--------------------------------------------------------------------------------

Kickstart your journey with js-moi-sdk by installing and importing it. Unleash its 
potential through comprehensive documentation and resources to supercharge 
your application development.

Installing
------------
Install the latest `release <https://github.com/sarvalabs/js-moi-sdk/releases>`_ 
using the following command:

.. code-block:: shell

    npm install js-moi-sdk

Importing
-----------
If you are using CommonJS or ES5, the require statement is used for 
importing `js-moi-sdk`.

.. code-block:: javascript

   const moi = require("js-moi-sdk")

If you are using ES6 or above, you can use the import statement to 
import `js-moi-sdk`.

.. code-block:: javascript

   import * as moi from "js-moi-sdk"

Key Concepts
------------
To begin, it's crucial to grasp the fundamental concepts that underpin the 
js-moi-sdk framework. Acquainting yourself with these concepts will empower you to 
utilize the js-moi-sdk package efficiently during your application development 
process.

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
