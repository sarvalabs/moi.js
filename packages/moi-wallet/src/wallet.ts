/*
    This module/directory is responsible for 
    handling wallet
*/

import * as bip39 from 'bip39';
import elliptic from 'elliptic';
import {HDNode} from "moi-hdnode";
import { randomBytes } from 'crypto';

/* Internal imports */
import { hexToUint8 } from "moi-utils";
import * as SigningKeyErrors from "./errors";

const SECP256K1 = "secp256k1"

const privateMapGet = (receiver: any, privateMap: any) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateGet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}

const privateMapSet = (receiver: any, privateMap: any, value: any) => {
    if (!privateMap.has(receiver)) {
        SigningKeyErrors.ErrPrivateSet()
    }
    const descriptor = privateMap.get(receiver);
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        descriptor.value = value;
    }
    return value;
}

const __vault = new WeakMap();

export class Wallet {
    constructor() {
        __vault.set(this, {
            value: void 0
        })
    }

    public load(key: Buffer | undefined, mnemonic: string | undefined, curve: string) {
        try {
            let privKey: string, pubKey: string;
            if(!key) {
                throw new Error("key cannot be undefined")
            }

            const ecPrivKey = new elliptic.ec(SECP256K1);
            const keyInBytes = hexToUint8(key)
            const keyPair = ecPrivKey.keyFromPrivate(keyInBytes)
            privKey = keyPair.getPrivate("hex")
            pubKey = keyPair.getPublic(true, "hex")
            
            privateMapSet(this, __vault, {
                _key: privKey,
                _mnemonic: mnemonic,
                _public: pubKey,
                _curve: curve
            });
        } catch(err) {
            throw err
        }
    }

    public async createRandom() {
        try {
            const _random16Bytes = randomBytes(16)
            var mnemonic = bip39.entropyToMnemonic(_random16Bytes, undefined);
            await this.fromMnemonic(mnemonic, undefined);
        }catch(e: any) {
            throw new Error(e.message);
        }
    }
    
    public async fromMnemonic(mnemonic: string, wordlist: undefined) {
        mnemonic = bip39.entropyToMnemonic(bip39.mnemonicToEntropy(mnemonic, wordlist), wordlist);
        try {
            const seed = await bip39.mnemonicToSeed(mnemonic, undefined);
            const hdNode = new HDNode()
            hdNode.fromSeed(seed);
            this.load(hdNode.privateKey(), mnemonic, SECP256K1)
        } catch(e: any) {
            throw new Error(e.message);
        }
    }

    public privateKey() { return privateMapGet(this, __vault)._key }
    public mnemonic() { return privateMapGet(this, __vault)._mnemonic }
    public publicKey() { return privateMapGet(this, __vault)._public }
    public curve() { return privateMapGet(this, __vault)._curve }
}
