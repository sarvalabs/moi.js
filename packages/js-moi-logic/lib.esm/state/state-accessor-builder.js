import { ElementType, ErrorCode, ErrorUtils } from "js-moi-utils";
import { SlotAccessorBuilder } from "./accessor-builder";
export class StateAccessorBuilder {
    ptr;
    logicDescriptor;
    slotAccessorBuilder;
    constructor(slot, elementDescriptor) {
        this.ptr = slot;
        this.logicDescriptor = elementDescriptor;
    }
    name(name) {
        const element = this.logicDescriptor.getElements().get(this.ptr);
        if (element == null) {
            ErrorUtils.throwError("Element not found", ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.ptr,
            });
        }
        if (element.kind !== ElementType.State) {
            ErrorUtils.throwError("Element is not a state", ErrorCode.INVALID_ARGUMENT, {
                ptr: this.ptr,
            });
        }
        const field = element.data.fields.find((field) => field.label === name);
        if (field == null) {
            ErrorUtils.throwError(`'${name}' is not member of ${element.data.mode} state`, ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: name,
            });
        }
        this.slotAccessorBuilder = new SlotAccessorBuilder(field, this.logicDescriptor);
        return this.slotAccessorBuilder;
    }
}
//# sourceMappingURL=state-accessor-builder.js.map