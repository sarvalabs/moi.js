Signer
======

The Signer class serves as a base class for various signer implementations and 
defines the common interface for signing interactions and messages.

Being an abstract class, the Signer class cannot be instantiated directly but 
serves as a blueprint for derived classes that provide concrete implementations. 
These derived classes include Wallet, and others. Each derived class represents 
a different way of signing interactions or messages.

The Signer class defines methods such as ``sign``, ``signInteractions`` and ``getIdentifier``,
which derived classes must implement. These methods handle the signing process and
address retrieval. By adhering to the Signer class's interface, derived classes
ensure compatibility and consistency when working with different types of signers.

Classes
-------

.. autoclass:: Signer
    :members: