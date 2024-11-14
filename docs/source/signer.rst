======
Signer
======

--------------------------------------------------------------------------------

The Signer class serves as a base class for various signer implementations and 
defines the common interface for signing interactions and messages.

Being an abstract class, the Signer class cannot be instantiated directly but 
serves as a blueprint for derived classes that provide concrete implementations. 
These derived classes include Wallet, and others. Each derived class represents 
a different way of signing interactions or messages.

The Signer class defines methods such as ``sign``, ``signInteractions``, 
``connect`` and ``getAddress``, which derived classes must implement. These 
methods handle the signing process and address retrieval. By adhering to the 
Signer class's interface, derived classes ensure compatibility and consistency 
when working with different types of signers.

Types
~~~~~

**SigningAlgorithms**

The ``SigningAlgorithms`` interface represents signing algorithms for cryptographic operations. It has the following property:

* ``ecdsa_secp256k1`` - ``ECDSA_S256``: The ECDSA with secp256k1 signing algorithm.

Abstract Methods
~~~~~~~~~~~~~~~~

**getAddress**

This method is used to retrieve the moi account address associated with 
the signer. Concrete classes that inherit from Signer must implement this method 
to provide the functionality of retrieving the address.

**connect**

This method is responsible for creating a new instance of the signer 
with a different provider. It allows switching the underlying provider while 
keeping the same signer configuration. Concrete classes need to implement this 
method to enable the functionality of connecting the signer to a different 
provider.

**sign**

This method is responsible for signing arbitrary messages using the 
MOI signing scheme. Concrete classes need to implement this method to 
enable the functionality of signing messages.

**signInteraction**

This method is used to sign MOI interactions. Concrete classes must 
implement this method to provide the logic for signing the interactions using 
the signer's private key.

Regular Methods
~~~~~~~~~~~~~~~

.. autofunction:: getProvider

.. code-block:: javascript
    
    // Example
    const provider = signer.getProvider();

.. autofunction:: getNonce

.. code-block:: javascript

    // Example
    const nonce = await signer.getNonce();
    console.log(nonce)

    >> 5

.. autofunction:: Signer#sendInteraction

.. code-block:: javascript

    // Example 1
    const response = await signer.sendInteraction({
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.ASSET_CREATE,
                payload: {
                    standard: AssetStandard.MAS0,
                    symbol: "TOKYO",
                    supply: 1248577
                }
            }
        ]
    })

    console.log(response)

    // Output
    /*
        {
            hash: '0x3492b59462fc7b8b9ec83296c6e04f314d0c93beb1cb2bfd267874b8e17c702c',
            wait: [Function: bound waitForInteraction] AsyncFunction,
            result: [Function: bound processResult] AsyncFunction
        }
    */

    // Example 2
    const response = await signer.sendInteraction({
        fuel_price: 1,
        fuel_limit: 200,
        ix_operations: [
            {
                type: OpType.ASSET_CREATE,
                payload: {
                    standard: AssetStandard.MAS0,
                    symbol: "NOVA",
                    supply: 1248577
                }
            },
            {
                type: OpType.ASSET_MINT,
                payload: {
                    asset_id: "0x00000000b9a9d618867bec092db71c06c368a6d7f78dc01cf36f86a35991fee11303c3d9",
                    amount: 50000
                }
            },
        ]
    })

    console.log(response)

    // Output
    /*
        {
            hash: '0xcade1ded604767e847a4a116b014a09c01347742de330869cf108d5f1fe2733a',
            wait: [Function: bound waitForInteraction] AsyncFunction,
            result: [Function: bound processResult] AsyncFunction
        }
    */

.. autofunction:: Signer#verify

.. code-block:: javascript

    // Example
    const message = Buffer.from("Hello, MOI", "utf-8");
    const signature = "0146304402201546497d46ed2ad7b1b77d1cdf383a28d988197bcad268be7163ebdf2f70645002207768e4225951c02a488713caf32d76ed8ea0bf3d7706128c59ee01788aac726402"
    const publicKey = Buffer.from(wallet.publicKey(), 'hex')
    const isVerified = signer.verify(message, signature, publicKey)
    console.log(isVerified)

    >> true
