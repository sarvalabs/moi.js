"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassFieldAccessor = exports.ArrayIndexAccessor = exports.PropertyAccessor = exports.LengthAccessor = exports.AbstractAccessor = exports.StorageKey = void 0;
exports.generateStorageKey = generateStorageKey;
const blake2b_1 = require("@noble/hashes/blake2b");
const bn_js_1 = __importDefault(require("bn.js"));
const js_polo_1 = require("js-polo");
const bytes_1 = require("./bytes");
const hex_1 = require("./hex");
class StorageKey {
    value;
    constructor(value) {
        this.value = new bn_js_1.default(value);
    }
    hex() {
        return (0, hex_1.bytesToHex)(this.toBytes());
    }
    toBytes() {
        return Uint8Array.from(this.value.toArray("be", 32));
    }
}
exports.StorageKey = StorageKey;
/**
 * AbstractAccessor class provides a base implementation of the Accessor interface.
 */
class AbstractAccessor {
    /**
     * Calculates the sum256 hash of a Uint8Array using the blake2b algorithm.
     * @param hash - The input Uint8Array to be hashed.
     * @returns The calculated sum256 hash as a Uint8Array.
     */
    sum256(hash) {
        return (0, blake2b_1.blake2b)(Uint8Array.from(hash), { dkLen: 32 });
    }
}
exports.AbstractAccessor = AbstractAccessor;
/**
 * Represents a LengthAccessor class that extends the AbstractAccessor class.
 *
 * It generates slot hash for accessing the length of an Array/VArray or a Map.
 */
class LengthAccessor extends AbstractAccessor {
    access(hash) {
        return hash;
    }
}
exports.LengthAccessor = LengthAccessor;
/**
 * Generates a slot hash for accessing the key of Map.
 */
class PropertyAccessor extends AbstractAccessor {
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
        const polorizer = new js_polo_1.Polorizer();
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
        const separator = (0, bytes_1.encodeText)(".");
        const bytes = (0, bytes_1.concatBytes)(hash.toBytes(), separator, this.key);
        return new StorageKey(this.sum256(bytes));
    }
}
exports.PropertyAccessor = PropertyAccessor;
/**
 * Represents an accessor for accessing elements in an array by index.
 */
class ArrayIndexAccessor extends AbstractAccessor {
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
        const slot = new bn_js_1.default(bytes).add(new bn_js_1.default(this.index));
        return new StorageKey(slot);
    }
}
exports.ArrayIndexAccessor = ArrayIndexAccessor;
/**
 * Represents an accessor for accessing fields of a class.
 */
class ClassFieldAccessor extends AbstractAccessor {
    index;
    constructor(index) {
        super();
        this.index = index;
    }
    access(hash) {
        let blob = this.sum256(hash.toBytes());
        const bn = new bn_js_1.default(blob).add(new bn_js_1.default(this.index));
        return new StorageKey(bn);
    }
}
exports.ClassFieldAccessor = ClassFieldAccessor;
function generateStorageKey(base, ...args) {
    let slot = typeof base === "number" ? new StorageKey(base) : base;
    const accessors = Array.isArray(args[0]) ? args[0] : args;
    for (const accessor of accessors) {
        slot = accessor.access(slot);
    }
    return slot;
}
//# sourceMappingURL=storage-key.js.map