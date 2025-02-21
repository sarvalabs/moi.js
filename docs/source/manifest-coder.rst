Manifest Call Encoder
=====================

The Manifest Call Encoder module enables the encoding and decoding of data 
according to the MOI Manifest specification. This specification defines the 
structure of routines, classes, methods, and state within logic object, allowing 
for seamless interaction with their properties.

Through this module, developers can encode data in compliance with the 
expected format specified by the logic Manifest. This is particularly valuable 
when preparing data for invoking routines on logic object. By correctly encoding 
routine parameters according to the logic Manifest, developers can generate 
accurate input data that aligns with the logic objects's expectations.

In addition, this facilitates the decoding of data received from the blockchain 
or logic objects. Developers can decode routine call results, and other Manifest-encoded 
data structures, enabling them to extract meaningful information. This 
capability greatly aids in the efficient processing and interpretation of data 
obtained from the MOI network.

Classes
-------

.. autoclass:: ElementDescriptor
   :members:

.. autoclass:: ManifestCoder
   :members:

.. autoclass:: Schema
   :members:

Functions
---------

.. autofunction:: isPrimitiveType

.. autofunction:: isArray

.. autofunction:: isClass

.. autofunction:: isMap