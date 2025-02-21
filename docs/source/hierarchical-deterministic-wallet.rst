Hierarchical Deterministic Wallet
=================================

The Wallet module extends the functionality of the Signer class, enhancing the 
management and interaction with MOI accounts. By extending the signer class, the 
wallet module inherits and adds additional features that simplify the process 
of handling cryptographic signing operations. Moreover, the wallet module 
supports Hierarchical Deterministic (HD) wallets, allowing users to generate 
master seeds, derive child keys, and organize multiple accounts within a single 
wallet. With the extended functionality of the signer class in the wallet 
module, users can seamlessly manage tasks such as checking nonce, sending 
interactions, and interacting with logic objects, providing a streamlined 
experience for MOI applications.

Usage
-----

A wallet can be created using a private key, mnemonic, or keystore. The ``Wallet``
class provides methods to instantiate a wallet.

Creating a Wallet from a Private Key
*************************************

.. code-block:: javascript
    
    import { CURVE, Wallet } from "js-moi-sdk";

    const privateKey = "0xe2fg1...";
    const wallet = new Wallet(pKey, CURVE.SECP256K1);

    console.log(wallet);

    >> Wallet

Creating a Wallet from a Mnemonic
**********************************

.. code-block:: javascript

    import { Wallet } from "js-moi-sdk";

    const mnemonic = "hollow appear ... hurdle";
    const wallet = await Wallet.fromMnemonic(mnemonic);

    console.log(wallet);

    >> Wallet

Creating a Wallet from a Keystore
**********************************

.. code-block:: javascript

    import { Wallet } from "js-moi-sdk";

    const keystore = { ... };
    const password = "password";
    const wallet = Wallet.fromKeystore(keystore, password);

    console.log(wallet);

    >> Wallet

Classes
-------

.. autoclass:: Wallet(privateKey, curve, [provider])
    :members: