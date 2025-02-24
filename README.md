![image](https://moi-js.s3.amazonaws.com/moi-banner.png)

[latestrelease]: https://github.com/sarvalabs/js-moi-sdk/releases/latest
[issueslink]: https://github.com/sarvalabs/js-moi-sdk/issues
[pullslink]: https://github.com/sarvalabs/js-moi-sdk/pulls
[pkgdocs]: https://docs.moi.technology/docs/build/packages/js-moi-sdk

[![docs](https://img.shields.io/badge/npm-documentation-red?style=for-the-badge)][pkgdocs]
[![npm version](https://img.shields.io/npm/v/js-moi-sdk.svg?style=for-the-badge)](https://npmjs.com/js-moi-sdk)
![license](https://img.shields.io/badge/license-MIT%2FApache--2.0-informational?style=for-the-badge)

[![latest tag](https://img.shields.io/github/v/tag/sarvalabs/js-moi-sdk?color=blue&label=latest%20tag&sort=semver&style=for-the-badge)][latestrelease]
[![issue count](https://img.shields.io/github/issues/sarvalabs/js-moi-sdk?style=for-the-badge&color=yellow)][issueslink]
[![pulls count](https://img.shields.io/github/issues-pr/sarvalabs/js-moi-sdk?style=for-the-badge&color=brightgreen)][pullslink]
![test status](https://img.shields.io/github/actions/workflow/status/sarvalabs/js-moi-sdk/test.yml?label=test&style=for-the-badge)

# js-moi-sdk

**js-moi-sdk** is a Javascript/Typescript implementation of a feature-rich library designed to seamlessly interact with the MOI Protocol and its extensive ecosystem. It provides a convenient interface for interacting with the MOI protocol, allowing developers to create, sign, and send interactions, retrieve account balances, access interaction history, and more.

## Installation

Install the latest [release](https://github.com/sarvalabs/js-moi-sdk/releases) using the following command.

```sh
npm install js-moi-sdk
```

```sh
yarn add js-moi-sdk
```

```sh
pnpm add js-moi-sdk
```

## Usage

```javascript
    import { HttpProvider } from "js-moi-sdk";
   
    const provider = new HttpProvider("...");
    const version = await provider.request("moi.Protocol", {
         modifier: { extract: "version" }
    });
   
    console.log(response);
   
    >>> { jsonrpc: "2.0", id: "2fb48ce4-3d38-45e4-87a5-0aa9d3d70299", result: "0.12.0" }
```

## Sub Packages

The **js-moi-sdk** package consists of several sub-packages, each offering independent functionality that can be utilized separately to enhance your development experience.

- [js-moi-constants](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-constants) This package includes common constants used within the js-moi-sdk ecosystem. These constants provide predefined values for various aspects of MOI, making it easier to work with the protocol.

- [js-moi-providers](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-providers) This package enables you to connect to MOI nodes and retrieve blockchain data, such as account balances and interaction history. It provides an interface for interacting with the MOI protocol and fetching information from the network.

- [js-moi-signer](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-signer) This package represents an MOI account with the ability to sign interactions and messages for cryptographic proof. It provides the necessary tools to sign interactions securely and authenticate interactions on the MOI network.

- [js-moi-bip39](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-bip39) This package offers the features necessary for generating and handling mnemonic phrases in accordance with the BIP39 standard.

- [js-moi-hdnode](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-hdnode) This package represents a Hierarchical Deterministic (HD) Node for cryptographic key generation and derivation. It allows you to generate and manage keys within a hierarchical structure, providing enhanced security and flexibility.

- [js-moi-wallet](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-wallet) This package represents a Hierarchical Deterministic Wallet capable of signing interactions and managing accounts. It provides a convenient interface for managing multiple accounts, generating keys, and securely signing interactions.

- [js-moi-manifest](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-manifest) This package encodes and decodes data according to the MOI Manifest specification, facilitating interaction with logic objects. It simplifies the process of encoding and decoding data structures, making it easier to work with MOI logic objects.

- [js-moi-logic](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-logic) This package simplifies interaction with MOI logic objects by offering deployment, interaction, and querying capabilities. It provides a higher-level interface for working with MOI logic, allowing you to deploy logic objects, send interactions, and retrieve results.

- [js-moi-utils](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-utils) This package offers a comprehensive set of tools and functions to enhance development with MOI. It provides utility functions that simplify common tasks, making your development experience smoother and more efficient.

- [js-moi-identifier](https://github.com/sarvalabs/js-moi-sdk/tree/main/packages/js-moi-identifier) This package provides utils for working with various identifiers used in the MOI ecosystem. It offers functions for getting and setting identifiers, as well as validating and formatting them according to the MOI standard.

## Contributing

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as below, without any additional terms or conditions.

## License

&copy; 2023 Sarva Labs Inc. & MOI Protocol Developers.

This project is licensed under either of

- [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE))
- [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT))

at your option.

The [SPDX](https://spdx.dev) license identifier for this project is `MIT OR Apache-2.0`.
