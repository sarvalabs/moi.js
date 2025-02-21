Utilities
=========

The utilities module offers a comprehensive set of tools and functions to 
simplify development process. This package encompasses various utility 
functions designed to enhance the overall development experience when working 
with MOI.

The utilities package offers a range of features, including address validation, 
data format conversion and cryptographic operations. These features are designed 
to ensure accuracy, security, and convenience throughout the development process.

Base64
------

.. autofunction:: decodeBase64

.. autofunction:: encodeBase64

Bytes
-----

.. autofunction:: concatBytes

.. autofunction:: decodeText

.. autofunction:: encodeText

.. autofunction:: hexDataLength

.. autofunction:: isBytes

.. autofunction:: isHexString

.. autofunction:: isInteger

.. autofunction:: randomBytes

Enums
-----

.. js:data:: AccountType

   Types of participant keys in the network

   - ``SargaAccount`` 
   - ``LogicAccount``
   - ``AssetAccount``
   - ``RegularAccount``

.. js:data:: AssetStandard

   Types of asset standards

   - ``MAS0`` 
   - ``MAS1``
  
.. js:data:: ElementType

   Types of element present in logic manifest

   - ``Constant`` 
   - ``Typedef``
   - ``Class``
   - ``Method``
   - ``Routine``
   - ``State``
   - ``Event``

.. js:data:: OpType
    
    Types of operations

    - ``ParticipantCreate``
    - ``AccountConfigure``
    - ``AssetTransfer``
    - ``AssetCreate``
    - ``AssetApprove``
    - ``AssetRevoke``
    - ``AssetMint``
    - ``AssetBurn``
    - ``AssetLockup``
    - ``AssetRelease``
    - ``LogicDeploy``
    - ``LogicInvoke``
    - ``LogicEnlist``
  
.. js:data:: LockType

    Types of participant locks

    - ``NoLock``
    - ``ReadLock``
    - ``MutateLock``

.. js:data:: ReceiptStatus

    Types of receipt status

    - ``Ok``
    - ``StateReverted``
    - ``InsufficientFuel``
  
.. js:data:: EngineKind

    Types of engine kind

    - ``PISA``
    - ``MERU``
  
.. js:data:: LogicState

    Types of logic state

    - ``Persistent``
    - ``Ephemeral``

.. js:data:: RoutineKind

    Types of routine kind

    - ``Persistent``
    - ``Ephemeral``
    - ``Readonly``
  
.. js:data:: RoutineType
    
    Types of routine type

    - ``Invoke``
    - ``Deploy``
    - ``Enlist``

.. js:data:: InteractionStatus
    
    Types of interaction status

    - ``Pending``
    - ``Finalized``
  
Hex
---

.. js:function:: bytesToHex(bytes)

   Converts a byte array to a hexadecimal string.

   :param bytes: a Uint8Array to convert
   :return: **Hex** - a hexadecimal string

.. autofunction:: ensureHexPrefix

.. autofunction:: hexToBN

.. js:function:: hexToBytes(bytes)

   Converts a hexadecimal string to a Uint8Array.

   :param hex: **str (string)** - The hexadecimal string to convert to a Uint8Array.
   :return: **UInt8Array** - The Uint8Array representation of the hexadecimal string.
   :throws: **Error** - If the input is not a valid hexadecimal string.

.. autofunction:: hexToHash

.. autofunction:: isHex

.. autofunction:: isNullBytes

.. autofunction:: numToHex

.. autofunction:: trimHexPrefix

Interaction
-----------

.. autofunction:: encodeInteraction

.. autofunction:: getInteractionRequestSchema

.. autofunction:: interaction

.. autofunction:: transformInteraction

.. autofunction:: validateIxRequest

Operation
---------

.. autofunction:: encodeOperation

.. autofunction:: getIxOperationDescriptor

.. autofunction:: isValidOperation

.. autofunction:: transformOperationPayload

.. autofunction:: validateOperation

Storage Keys
------------

.. autoclass:: StorageKey
   :members:

.. autoclass:: ArrayIndexAccessor
   :members:

.. autoclass:: ClassFieldAccessor
   :members:

.. autoclass:: LengthAccessor
    :members:

.. autoclass:: PropertyAccessor
    :members:

.. autofunction:: generateStorageKey

Properties
----------

.. autofunction:: defineReadOnly

Object
------

.. autofunction:: deepCopy

Error
-----

.. autoclass:: CustomError
   :members:

.. autoclass:: ErrorUtils
   :members: