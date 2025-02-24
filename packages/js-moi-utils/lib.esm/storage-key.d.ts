import BN from "bn.js";
import { type Hex } from "./hex";
export declare class StorageKey {
    private value;
    constructor(value: number | string | Uint8Array | BN);
    hex(): Hex;
    toBytes(): Uint8Array;
}
/**
 * Represents an accessor that provides access to a slot hash.
 */
export interface Accessor {
    /**
     * Retrieves the slot hash associated with the given hash.
     *
     * @param hash - The hash of the slot.
     * @returns The slot hash associated with the given hash.
     */
    access(hash: StorageKey): StorageKey;
}
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
export declare abstract class AbstractAccessor implements Accessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    protected sum256(hash: Uint8Array): Uint8Array;
    /**
     * Abstract method that needs to be implemented by subclasses.
     * It defines the logic for accessing a SlotHash.
     * @param hash - The SlotHash to be accessed.
     * @returns The accessed SlotHash.
     */
    abstract access(hash: StorageKey): StorageKey;
}
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
export declare class LengthAccessor extends AbstractAccessor {
    access(hash: StorageKey): StorageKey;
}
/**
 * Generates a slot hash for accessing the key of Map.
 */
export declare class PropertyAccessor extends AbstractAccessor {
    key: Uint8Array;
    /**
     * Creates a new instance of PropertyAccessor.
     * @param key The label of the property.
     */
    constructor(key: string | number);
    /**
     * Polorizes the given key.
     * @param key The key to polorize.
     * @returns The polorized key as a bytes.
     */
    private polorize;
    /**
     * Accesses the property with the given hash and returns the resulting hash.
     * @param hash The hash of the property.
     * @returns The resulting hash after accessing the property.
     */
    access(hash: StorageKey): StorageKey;
}
/**
 * Represents an accessor for accessing elements in an array by index.
 */
export declare class ArrayIndexAccessor extends AbstractAccessor {
    private index;
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    constructor(index: number);
    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    access(hash: StorageKey): StorageKey;
}
/**
 * Represents an accessor for accessing fields of a class.
 */
export declare class ClassFieldAccessor extends AbstractAccessor {
    private index;
    constructor(index: number);
    access(hash: StorageKey): StorageKey;
}
/**
 * Generates a slot hash based on the provided base and accessors.
 *
 * @param base - The base value for the slot hash.
 * @param accessors - The accessors used to generate the slot hash.
 * @returns The generated slot hash as a Uint8Array.
 */
export declare function generateStorageKey(base: number | StorageKey, ...accessors: Accessor[]): StorageKey;
/**
 * Generates a slot hash based on the provided base value and array of accessors.
 *
 * @param base - The base value for generating the slot hash.
 * @param accessorsArray - An array of accessors used in generating the slot hash.
 * @returns The generated slot hash as a Uint8Array.
 */
export declare function generateStorageKey(base: number | StorageKey, accessorsArray: Accessor[]): StorageKey;
//# sourceMappingURL=storage-key.d.ts.map