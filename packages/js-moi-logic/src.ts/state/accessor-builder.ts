import { isPrimitiveType, Schema, type ElementDescriptor } from "js-moi-manifest";
import { ArrayIndexAccessor, ClassFieldAccessor, ErrorCode, ErrorUtils, LengthAccessor, PropertyAccessor, type Accessor, type TypeField } from "js-moi-utils";
import type { AccessorProvider, StorageTypeProvider } from "./accessor";

const VALUE_TYPE_INDEX = 1;

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

export class SlotAccessorBuilder implements AccessorBuilder, AccessorProvider, StorageTypeProvider {
    private accessors: Accessor[] = [];

    public readonly elementDescriptor: ElementDescriptor;

    private slotType: string;

    private readonly typeField: TypeField;

    public constructor(field: TypeField, logicDescriptor: ElementDescriptor) {
        this.elementDescriptor = logicDescriptor;
        this.typeField = field;
        this.slotType = field.type;
    }

    /**
     * Retrieves the storage type of the accessor builder.
     * @returns The storage type.
     */
    public getStorageType(): string {
        return this.slotType;
    }

    /**
     * Retrieves the base slot of the accessor builder.
     * @returns The base slot.
     */
    public getBaseSlot(): number {
        return this.typeField.slot;
    }

    /**
     * Retrieves the accessors of the accessor builder.
     * @returns The accessors.
     */
    public getAccessors(): Accessor[] {
        return this.accessors;
    }

    public length(): void {
        if (isPrimitiveType(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access the length of primitive on type "${this.slotType}"`, ErrorCode.UNEXPECTED_ARGUMENT);
        }

        this.slotType = "u64";
        this.accessors.push(new LengthAccessor());
    }

    public property(key: string): SlotAccessorBuilder {
        this.slotType = Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new PropertyAccessor(key));

        return this;
    }

    public at(index: number): SlotAccessorBuilder {
        this.slotType = Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new ArrayIndexAccessor(index));

        return this;
    }

    public field(fieldName: string): SlotAccessorBuilder {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`, ErrorCode.UNEXPECTED_ARGUMENT);
        }

        const element = this.elementDescriptor.getClassElement(this.slotType);
        const field = element.data.fields.find((field) => field.label === fieldName);

        if (field == null) {
            ErrorUtils.throwError(
                `The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`,
                ErrorCode.PROPERTY_NOT_DEFINED,
                {
                    field: fieldName,
                }
            );
        }

        this.slotType = field.type;
        this.accessors.push(new ClassFieldAccessor(field.slot));

        return this;
    }

    /**
     * Checks if the given `builder` is an instance of `SlotAccessorBuilder`.
     *
     * @param builder - The accessor builder to check.
     * @returns `true` if the `builder` is an instance of `SlotAccessorBuilder`, `false` otherwise.
     */
    public static isSlotAccessorBuilder(builder: unknown): builder is SlotAccessorBuilder {
        return builder instanceof SlotAccessorBuilder;
    }
}
