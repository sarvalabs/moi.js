Identifier
==========

In the MOI network ecosystem, an identifier is a unique string
that represents a specific asset, logic or participant. Full 
specification of identifier can be found in the
`Specification <https://github.com/sarvalabs/go-moi-identifiers/blob/main/SPECIFICATION.md>`_.
This package provides functionality to extract flags, metadata,
variant IDs, and account IDs from an identifier. It also includes
validation for multiple versions of each identifier.

Classes
-------

.. autoclass:: IdentifierTag
    :members:


.. autoclass:: Identifier
    :members:

.. autoclass:: ParticipantId
    :members:

.. autoclass:: LogicId
    :members:

.. autoclass:: AssetId
    :members:

.. autoclass:: KramaId
    :members:

Functions
---------

.. autofunction:: createParticipantId

.. autofunction:: isIdentifier
