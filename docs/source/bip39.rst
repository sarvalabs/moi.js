Bip39
=====

The `BIP39 <https://en.bitcoin.it/wiki/BIP_0039>`_ module provides utility 
functions for working with mnemonic phrases, entropy, and seed generation. It 
includes methods for converting mnemonic phrases to seeds synchronously and 
asynchronously, converting mnemonic phrases to their corresponding entropy 
values and vice versa, generating mnemonic phrases with specified strengths, 
and validating the correctness of mnemonic phrases.

Functions
---------

.. autofunction:: mnemonicToSeed

.. autofunction:: mnemonicToSeedSync

.. autofunction:: mnemonicToEntropy

.. autofunction:: entropyToMnemonic

.. autofunction:: generateMnemonic

.. autofunction:: validateMnemonic

.. autofunction:: getDefaultWordlist
