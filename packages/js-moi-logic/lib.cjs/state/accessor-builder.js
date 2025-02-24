"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotAccessorBuilder = void 0;
const js_moi_manifest_1 = require("js-moi-manifest");
const js_moi_utils_1 = require("js-moi-utils");
const VALUE_TYPE_INDEX = 1;
class SlotAccessorBuilder {
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
        if ((0, js_moi_manifest_1.isPrimitiveType)(this.slotType)) {
            js_moi_utils_1.ErrorUtils.throwError(`Attempting to access the length of primitive on type "${this.slotType}"`, js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        this.slotType = "u64";
        this.accessors.push(new js_moi_utils_1.LengthAccessor());
    }
    property(key) {
        this.slotType = js_moi_manifest_1.Schema.extractMapDataType(this.slotType)[VALUE_TYPE_INDEX];
        this.accessors.push(new js_moi_utils_1.PropertyAccessor(key));
        return this;
    }
    at(index) {
        this.slotType = js_moi_manifest_1.Schema.extractArrayDataType(this.slotType);
        this.accessors.push(new js_moi_utils_1.ArrayIndexAccessor(index));
        return this;
    }
    field(fieldName) {
        if (!this.elementDescriptor.getClassDefs().has(this.slotType)) {
            js_moi_utils_1.ErrorUtils.throwError(`Attempting to access a field '${fieldName}' in ${this.slotType}, which is not a recognized class.`, js_moi_utils_1.ErrorCode.UNEXPECTED_ARGUMENT);
        }
        const element = this.elementDescriptor.getClassElement(this.slotType);
        const field = element.data.fields.find((field) => field.label === fieldName);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`The field '${fieldName}' is not a recognized member of the class '${this.slotType}'. Please ensure that the field name is correct and that it is defined within the class context.`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                field: fieldName,
            });
        }
        this.slotType = field.type;
        this.accessors.push(new js_moi_utils_1.ClassFieldAccessor(field.slot));
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
exports.SlotAccessorBuilder = SlotAccessorBuilder;
//# sourceMappingURL=accessor-builder.js.map