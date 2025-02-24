"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateAccessorBuilder = void 0;
const js_moi_utils_1 = require("js-moi-utils");
const accessor_builder_1 = require("./accessor-builder");
class StateAccessorBuilder {
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
            js_moi_utils_1.ErrorUtils.throwError("Element not found", js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                ptr: this.ptr,
            });
        }
        if (element.kind !== js_moi_utils_1.ElementType.State) {
            js_moi_utils_1.ErrorUtils.throwError("Element is not a state", js_moi_utils_1.ErrorCode.INVALID_ARGUMENT, {
                ptr: this.ptr,
            });
        }
        const field = element.data.fields.find((field) => field.label === name);
        if (field == null) {
            js_moi_utils_1.ErrorUtils.throwError(`'${name}' is not member of ${element.data.mode} state`, js_moi_utils_1.ErrorCode.PROPERTY_NOT_DEFINED, {
                entity: name,
            });
        }
        this.slotAccessorBuilder = new accessor_builder_1.SlotAccessorBuilder(field, this.logicDescriptor);
        return this.slotAccessorBuilder;
    }
}
exports.StateAccessorBuilder = StateAccessorBuilder;
//# sourceMappingURL=state-accessor-builder.js.map