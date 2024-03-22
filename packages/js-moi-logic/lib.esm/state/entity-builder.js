import { ErrorCode, ErrorUtils } from "js-moi-utils";
import { SlotAccessorBuilder } from "./accessor-builder";
export class EntityBuilder {
    slot;
    elementDescriptor;
    constructor(slot, elementDescriptor) {
        this.slot = slot;
        this.elementDescriptor = elementDescriptor;
    }
    entity(label) {
        const element = this.elementDescriptor.getElements().get(this.slot)?.data;
        if (element == null) {
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.slot,
            });
        }
        const field = element.fields.find((field) => field.label === label);
        if (field == null) {
            ErrorUtils.throwError(`'${label} is not member of persistance state`, ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: label,
            });
        }
        return SlotAccessorBuilder.fromTypeField(field, this.elementDescriptor);
    }
}
//# sourceMappingURL=entity-builder.js.map