import type { Accessor } from "js-moi-utils";
/**
 * Represents an accessor provider that provides accessors.
 */
export interface AccessorProvider {
    /**
     * Retrieves the accessors.
     * @returns An array of accessors.
     */
    getAccessors(): Accessor[];
}
/**
 * Represents a interface that provides the type of the value present at slot hash.
 */
export interface StorageTypeProvider {
    /**
     * Gets the type of the slot hash.
     * @returns The type of the slot hash as a string.
     */
    getStorageType(): string;
}
//# sourceMappingURL=accessor.d.ts.map