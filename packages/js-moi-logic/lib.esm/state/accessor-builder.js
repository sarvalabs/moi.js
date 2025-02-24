import { isPrimitiveType, Schema } from "js-moi-manifest";
import { ArrayIndexAccessor, ClassFieldAccessor, ErrorCode, ErrorUtils, LengthAccessor, PropertyAccessor } from "js-moi-utils";
const VALUE_TYPE_INDEX = 1;
export class SlotAccessorBuilder {
    accessors = [];
    elementDescriptor;
    slotType;
    typeField;
    constructor(field, logicDescriptor) {
        this.elementDescriptor = logicDescriptor;
        this.typeField = field;
        this.slotType = field.type;
    }
    /**
     * Retrieves the storage type of the accessor builder.
     * @returns The storage type.
     */
    getStorageType() {
        return this.slotType;
    }
    /**
     * Retrieves the base slot of the accessor builder.
     * @returns The base slot.
     */
    getBaseSlot() {
        return this.typeField.slot;
    }
    /**
     * Retrieves the accessors of the accessor builder.
     * @returns The accessors.
     */
    getAccessors() {
        return this.accessors;
    }
    length() {
        if (isPrimitiveType(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access the length of primitive on type "${this.slotType}"`, ErrorCode.UNEXPECTED_ARGUMENT);
        }
        this.slotType = "u64";
        this.accessors.push(new LengthAccessor());
    }
    property(key) {
        this.slotType = Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new PropertyAccessor(key));
        return this;
    }
    at(index) {
        this.slotType = Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new ArrayIndexAccessor(index));
        return this;
    }
    field(fieldName) {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            ErrorUtils.throwError(`Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`, ErrorCode.UNEXPECTED_ARGUMENT);
        }
        const element = this.elementDescriptor.getClassElement(this.slotType);
        const field = element.data.fields.find((field) => field.label === fieldName);
        if (field == null) {
            ErrorUtils.throwError(`The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`, ErrorCode.PROPERTY_NOT_DEFINED, {
                field: fieldName,
            });
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
    static isSlotAccessorBuilder(builder) {
        return builder instanceof SlotAccessorBuilder;
    }
}
//# sourceMappingURL=accessor-builder.js.map