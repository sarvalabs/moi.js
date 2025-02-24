import { blake2b } from "@noble/hashes/blake2b";
import BN from "bn.js";
import { Polorizer } from "js-polo";
import { concatBytes, encodeText } from "./bytes";
import { bytesToHex, type Hex } from "./hex";

export class StorageKey {
    private value: BN;

    constructor(value: number | string | Uint8Array | BN) {
        this.value = new BN(value);
    }

    hex(): Hex {
        return bytesToHex(this.toBytes());
    }

    toBytes(): Uint8Array {
        return Uint8Array.from(this.value.toArray("be", 32));
    }
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
export abstract class AbstractAccessor implements Accessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    protected sum256(hash: Uint8Array): Uint8Array {
        return blake2b(Uint8Array.from(hash), { dkLen: 32 });
    }

    /**
     * Abstract method that needs to be implemented by subclasses.
     * It defines the logic for accessing a SlotHash.
     * @param hash - The SlotHash to be accessed.
     * @returns The accessed SlotHash.
     */
    public abstract access(hash: StorageKey): StorageKey;
}

/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
export class LengthAccessor extends AbstractAccessor {
    public access(hash: StorageKey): StorageKey {
        return hash;
    }
}

/**
 * Generates a slot hash for accessing the key of Map.
 */
export class PropertyAccessor extends AbstractAccessor {
    key: Uint8Array;

    /**
     * Creates a new instance of PropertyAccessor.
     * @param key The label of the property.
     */
    public constructor(key: string | number) {
        super();
        this.key = this.sum256(this.polorize(key));
    }

    /**
     * Polorizes the given key.
     * @param key The key to polorize.
     * @returns The polorized key as a bytes.
     */
    private polorize(key: string | number | boolean | Uint8Array): Uint8Array {
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
    public access(hash: StorageKey): StorageKey {
        const separator = encodeText(".");
        const bytes = concatBytes(hash.toBytes(), separator, this.key);

        return new StorageKey(this.sum256(bytes));
    }
}

/**
 * Represents an accessor for accessing elements in an array by index.
 */
export class ArrayIndexAccessor extends AbstractAccessor {
    /**
     * Creates a new instance of ArrayIndexAccessor.
     * @param index The index of the element to access.
     */
    public constructor(private index: number) {
        super();
    }

    /**
     * Generates a slot hash for accessing the element at the given index.
     * @param hash The input hash.
     * @returns The updated hash after accessing the element.
     */
    public access(hash: StorageKey): StorageKey {
        const bytes = this.sum256(hash.toBytes());
        const slot = new BN(bytes).add(new BN(this.index));
        return new StorageKey(slot);
    }
}

/**
 * Represents an accessor for accessing fields of a class.
 */
export class ClassFieldAccessor extends AbstractAccessor {
    constructor(private index: number) {
        super();
    }

    public access(hash: StorageKey): StorageKey {
        let blob = this.sum256(hash.toBytes());
        const bn = new BN(blob).add(new BN(this.index));

        return new StorageKey(bn);
    }
}

/**
 * Generates a slot hash based on the provided base and accessors.
 *
 * @param base - The base value for the slot hash.
 * @param accessors - The accessors used to generate the slot hash.
 * @returns The generated slot hash as a Uint8Array.
 */
export function generateStorageKey(base: number | StorageKey, ...accessors: Accessor[]): StorageKey;
/**
 * Generates a slot hash based on the provided base value and array of accessors.
 *
 * @param base - The base value for generating the slot hash.
 * @param accessorsArray - An array of accessors used in generating the slot hash.
 * @returns The generated slot hash as a Uint8Array.
 */
export function generateStorageKey(base: number | StorageKey, accessorsArray: Accessor[]): StorageKey;
export function generateStorageKey(base: number | StorageKey, ...args: any[]): StorageKey {
    let slot = typeof base === "number" ? new StorageKey(base) : base;

    const accessors: Accessor[] = Array.isArray(args[0]) ? args[0] : args;

    for (const accessor of accessors) {
        slot = accessor.access(slot);
    }

    return slot;
}
