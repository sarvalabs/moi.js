import type { LogicDescriptor } from "../logic-descriptor";
import { type AccessorBuilder } from "./accessor-builder";
export declare class StateAccessorBuilder {
    private readonly ptr;
    private readonly logicDescriptor;
    private slotAccessorBuilder?;
    constructor(slot: number, elementDescriptor: LogicDescriptor);
    name(name: string): AccessorBuilder;
}
//# sourceMappingURL=state-accessor-builder.d.ts.map