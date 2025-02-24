import { type ElementDescriptor } from "js-moi-manifest";
import { type Accessor, type TypeField } from "js-moi-utils";
import type { AccessorProvider, StorageTypeProvider } from "./accessor";
export interface AccessorBuilder {
    /**
     * Adds a length accessor to the accessor builder.
     * This accessor can be used to retrieve the length of an array or map.
     *
     * @returns The accessor builder instance.
     */
    length(): void;
    /**
     * Adds a property accessor to the accessor builder.
     *
     * Used to access to value of key in a map.
     *
     * @param key - The label of the property.
     * @returns The accessor builder instance.
     */
    property(key: string | number | boolean | Uint8Array): AccessorBuilder;
    /**
     * Adds an accessor for the specified index to the AccessorBuilder.
     *
     * @param index - The index of the accessor.
     * @returns The AccessorBuilder instance.
     */
    at(index: number): AccessorBuilder;
    /**
     * Adds a field to the accessor builder.
     *
     * Used to access the value of a field in a class.
     *
     * @param fieldName - The label of the field.
     * @returns The accessor builder instance.
     */
    field(fieldName: string): AccessorBuilder;
}
export declare class SlotAccessorBuilder implements AccessorBuilder, AccessorProvider, StorageTypeProvider {
    private accessors;
    readonly elementDescriptor: ElementDescriptor;
    private slotType;
    private readonly typeField;
    constructor(field: TypeField, logicDescriptor: ElementDescriptor);
    /**
     * Retrieves the storage type of the accessor builder.
     * @returns The storage type.
     */
    getStorageType(): string;
    /**
     * Retrieves the base slot of the accessor builder.
     * @returns The base slot.
     */
    getBaseSlot(): number;
    /**
     * Retrieves the accessors of the accessor builder.
     * @returns The accessors.
     */
    getAccessors(): Accessor[];
    length(): void;
    property(key: string): SlotAccessorBuilder;
    at(index: number): SlotAccessorBuilder;
    field(fieldName: string): SlotAccessorBuilder;
    /**
     * Checks if the given `builder` is an instance of `SlotAccessorBuilder`.
     *
     * @param builder - The accessor builder to check.
     * @returns `true` if the `builder` is an instance of `SlotAccessorBuilder`, `false` otherwise.
     */
    static isSlotAccessorBuilder(builder: unknown): builder is SlotAccessorBuilder;
}
//# sourceMappingURL=accessor-builder.d.ts.map