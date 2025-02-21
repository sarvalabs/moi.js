Hierarchical Deterministic Node
===============================

The ``HDNode`` class in js-moi-sdk represents a Hierarchical Deterministic (HD) Node 
used for cryptographic key generation and derivation. It follows the `BIP-32 
<https://en.bitcoin.it/wiki/BIP_0032>`_ standard and allows the creation of 
hierarchical deterministic wallets. With HDNode, developers can generate and 
derive child keys, create private and public keys, derive MOI account addresses, 
and serialize/deserialize HDNode instances. It simplifies the management of 
multiple addresses and keys within a single wallet, enhancing security and 
organization.

Classes
-------

.. autoclass:: HDNode
    :members:
    