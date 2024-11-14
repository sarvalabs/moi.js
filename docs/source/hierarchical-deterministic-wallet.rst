=================================
Hierarchical Deterministic Wallet
=================================

--------------------------------------------------------------------------------

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

Types
-----
**Keystore**

The ``Keystore`` interface represents a keystore object. It has the following properties:

* ``cipher`` - ``string``: The cipher used for encryption.
* ``ciphertext`` - ``string``: The encrypted ciphertext.
* ``cipherparams`` - ``object``: Parameters for the cipher, containing the following property:
 
  - ``IV`` - ``string``: The initialization vector used for encryption.

* ``kdf`` - ``string``: The key derivation function used.
* ``kdfparams`` - ``object``: Parameters for the key derivation function, containing the following properties:
  
  - ``dklen`` - ``number``: The length of the derived key.

  - ``n`` - ``number``: The iteration count.

  - ``p`` - ``number``: The parallelization factor.

  - ``r`` - ``number``: The block size.

  - ``salt`` - ``string``: The salt value.

* ``mac`` - ``string``: The message authentication code.

Wallet
------

A class representing a Hierarchical Deterministic Wallet that can sign interactions and manage accounts.

.. code-block:: javascript

    // Example
    const mnemonic = "hollow appear story text start mask salt social child ...";

    const wallet = await Wallet.fromMnemonic(mnemonic);


Creating Instances
======================

- Create a wallet instance from private key

    .. code-block:: javascript

        const privateKey = "0x...";

        const wallet = new Wallet(privateKey, CURVE.SECP256K1);
  
-  Create a wallet instance from a mnemonic

    .. code-block:: javascript

        const mnemonic = "hollow appear story text start mask salt social child ...";

        const wallet = await Wallet.fromMnemonic(mnemonic);

- Create a wallet instance from JSON keystore

    .. code-block:: javascript

        const keystore = `{
            "cipher": "aes-128-ctr",
            "ciphertext": "...",
            "cipherparams": {
                "IV": "..."
            },
            "kdf": "scrypt",
            "kdfparams": {
                "n": 4096,
                "r": 8,
                "p": 1,
                "dklen": 32,
                "salt": "..."
            },
            "mac": "..."
        }`;
        const password = "YOUR_PASSWORD_HERE";

        const wallet = await Wallet.fromKeystore(keystore, password);

- Create a wallet instance from a random mnemonic

    .. code-block:: javascript

        const wallet = await Wallet.createRandom();

Properties
======================

- ``address`` - ``readonly`` ``string`` : The address of the wallet.

.. code-block:: javascript

    console.log(wallet.address);
    >> "0x87925..."

- ``publicKey`` - ``readonly`` ``string``: The public key of the wallet.

.. code-block:: javascript

    console.log(wallet.publicKey);
    >> "038792..."

- ``privateKey`` - ``readonly`` ``string``: The private key of the wallet. 

.. code-block:: javascript

    console.log(wallet.privateKey);
    >> "0x87925..."

- ``mnemonic`` - ``readonly`` ``string``: The mnemonic of the wallet.

.. code-block:: javascript

    console.log(wallet.mnemonic);
    >> "hollow appear story text start mask salt social child ..."

- ``curve`` - ``readonly`` ``string``: The curve of the wallet.

.. code-block:: javascript

    console.log(wallet.curve);
    >> "secp256k1"


Methods
======================

.. autofunction:: Wallet#sign


**Example**

.. code-block:: javascript

  const message = "Hello, MOI";
  const algo = wallet.signingAlgorithms["ecdsa_secp256k1"];

  const signature = wallet.sign(Buffer.from(message), algo);
  >> "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee..."

.. autofunction:: Wallet#signInteraction

.. code-block:: javascript

    const address = "0x870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b";
    const interaction = {
        nonce: 0,
        sender: address,
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.ASSET_CREATE,
                payload: {
                    standard: AssetStandard.MAS0,
                    symbol: "SIG",
                    supply: 1248577
                }
            }
        ]
    }
    const sigAlgo = wallet.signingAlgorithms["ecdsa_secp256k1"];
    const signedIxn = wallet.signInteraction(interaction, sigAlgo);
    console.log(signedIxn)
    
    // Output
    /*
        {
            ix_args:'0e9f0203131696049608900c900c930ca30cb60c03870ad6c5150ea8c0355316974873313004c6b9425a855a06fff16f408b0e0a8b0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c80e7f063363636161604d4f49130d41',
            signature: '01463044022059e8e9839a02d2a0b2585e2267400826f91e575eb27cb89485d2deab697c5a34022020d71b2d3caa8c0b003849a2cb4effdbfd32028357db335549a75c82dd329f8902'
        }
    */

.. autofunction:: Wallet#generateKeystore

.. autofunction:: Wallet.fromMnemonic

.. autofunction:: Wallet.fromMnemonicSync

.. autofunction:: Wallet.fromKeystore

.. autofunction:: Wallet.createRandom

.. autofunction:: Wallet.createRandomSync