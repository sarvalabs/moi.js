import { ElementType, EngineKind, RoutineKind, type LogicState, type RoutineType } from "../enums";
import type { Hex } from "../hex";
export interface EngineConfig {
    kind: EngineKind;
    flags: string[];
}
export type CocoPrimitiveType = "null" | "ptr" | "bool" | "bytes" | "string" | "address" | "u64" | "i64" | "u256";
interface Constant {
    type: CocoPrimitiveType;
    value: Hex;
}
type TypeDef = string;
export interface TypeField {
    slot: number;
    label: string;
    type: CocoPrimitiveType | (TypeDef & {});
}
interface MethodField {
    ptr: number;
    code: number;
}
interface Class {
    name: string;
    fields: TypeField[];
    methods?: MethodField[];
}
interface State {
    mode: LogicState;
    fields: TypeField[];
}
interface Instructions {
    bin?: number[];
    hex: Hex;
    asm?: string[];
}
type Catch = string;
interface Routine {
    name: string;
    mode: RoutineKind;
    kind: RoutineType;
    accepts: TypeField[];
    returns: TypeField[];
    executes: Instructions;
    catches: Catch[];
}
interface Method {
    name: string;
    class: string;
    mutable: boolean;
    accepts: TypeField[];
    returns: TypeField[];
    executes: Instructions;
    catches: Catch[];
}
interface Event {
    name: string;
    topics: number;
    fields: TypeField[];
}
export type ElementData<TKind extends ElementType> = TKind extends ElementType.Constant ? Constant : TKind extends ElementType.Typedef ? TypeDef : TKind extends ElementType.Class ? Class : TKind extends ElementType.State ? State : TKind extends ElementType.Routine ? Routine : TKind extends ElementType.Method ? Method : TKind extends ElementType.Event ? Event : never;
export interface Element<TKind extends ElementType> {
    ptr: number;
    kind: TKind;
    deps?: Element<TKind>["ptr"][];
    data: ElementData<TKind>;
}
export type LogicElement = Element<ElementType.Class> | Element<ElementType.Constant> | Element<ElementType.Typedef> | Element<ElementType.State> | Element<ElementType.Routine> | Element<ElementType.Method> | Element<ElementType.Event>;
export interface LogicManifest {
    syntax: number;
    engine: EngineConfig;
    elements: LogicElement[];
}
export {};
//# sourceMappingURL=manifest.d.ts.map