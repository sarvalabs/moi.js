import { blake2b } from "@noble/hashes/blake2b";
import BN from "bn.js";
import { Polorizer } from "js-polo";
import { concatBytes, encodeText } from "./bytes";
import { bytesToHex } from "./hex";
/**
 * Represents a storage key with a value that can be converted to different formats.
 */
export class StorageKey {
    value;
    /**
     * Creates an instance of StorageKey.
     * @param value - The value of the storage key, which can be a number, string, Uint8Array, or BN.
     */
    constructor(value) {
        this.value = new BN(value);
    }
    /**
     * Converts the storage key value to a hexadecimal string.
     * @returns The hexadecimal representation of the storage key value.
     */
    hex() {
        return bytesToHex(this.toBytes());
    }
    /**
     * Converts the storage key value to a byte array.
     * @returns The byte array representation of the storage key value.
     */
    toBytes() {
        return Uint8Array.from(this.value.toArray("be", 32));
    }
}
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
export class AbstractAccessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash) {
        return blake2b(Uint8Array.from(hash), { dkLen: 32 });
    }
}
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
export class LengthAccessor extends AbstractAccessor {
    /**
     * Accesses the provided storage key.
     *
     * @param hash - The storage key to be accessed.
     * @returns The same storage key that was provided.
     */
    access(hash) {
        return hash;
    }
}
/**
 * Generates a slot hash for accessing the key of Map.
 */
export class PropertyAccessor extends AbstractAccessor {
    key;
    /**
     * Creates a new instance of PropertyAccessor.
     * @param key The label of the property.
     */
    constructor(key) {
        super();
        this.key = this.sum256(this.polorize(key));
    }
    /**
     * Polorizes the given key.
     * @param key The key to polorize.
     * @returns The polorized key as a bytes.
     */
    polorize(key) {
        const polorizer = new Polorizer();
        switch (true) {
            case typeof key === "string":
                polorizer.polorizeString(key);
                break;
            case typeof key === "number":
                if (Number.isInteger(key)) {
                    polorizer.polorizeInteger(key);
                }
                if (!Number.isInteger(key)) {
                    polorizer.polorizeFloat(key);
                }
                break;
            case typeof key === "boolean":
                polorizer.polorizeBool(key);
                break;
            case key instanceof Uint8Array:
                polorizer.polorizeBytes(key);
                break;
            default:
                throw new Error(`Unsupported type: ${typeof key}`);
        }
        return polorizer.bytes();
    }
    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash) {
        const separator = encodeText(".");
        const bytes = concatBytes(hash.toBytes(), separator, this.key);
        return new StorageKey(this.sum256(bytes));
    }
}
/**
 * Represents an accessor for accessing elements in an array by index.
 */
export class ArrayIndexAccessor extends AbstractAccessor {
    index;
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    constructor(index) {
        super();
        this.index = index;
    }
    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    access(hash) {
        const bytes = this.sum256(hash.toBytes());
        const slot = new BN(bytes).add(new BN(this.index));
        return new StorageKey(slot);
    }
}
/**
 * Represents an accessor for accessing fields of a class.
 */
export class ClassFieldAccessor extends AbstractAccessor {
    index;
    constructor(index) {
        super();
        this.index = index;
    }
    /**
     * Computes a new `StorageKey` by hashing the provided `StorageKey` and adding an index.
     *
     * @param {StorageKey} hash - The `StorageKey` to be hashed and used for computation.
     * @returns {StorageKey} - The newly computed `StorageKey`.
     */
    access(hash) {
        let blob = this.sum256(hash.toBytes());
        const bn = new BN(blob).add(new BN(this.index));
        return new StorageKey(bn);
    }
}
/**
 * Generates a slot hash based on the provided base value and accessors.
 *
 * @param {number | StorageKey} base - The base value for generating the slot hash.
 * @param {...Accessor} args - The accessors used in generating the slot hash.
 * @returns {StorageKey} - The generated slot hash as a StorageKey.
 */
export function generateStorageKey(base, ...args) {
    let slot = typeof base === "number" ? new StorageKey(base) : base;
    const accessors = Array.isArray(args[0]) ? args[0] : args;
    for (const accessor of accessors) {
        slot = accessor.access(slot);
    }
    return slot;
}
//# sourceMappingURL=storage-key.js.map