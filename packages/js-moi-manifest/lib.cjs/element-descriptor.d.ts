import { Element, ElementType, type ElementData, type LogicElement } from "js-moi-utils";
import type { EventDef, MethodDef, RoutineDef } from "./types/manifest";
/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export declare class ElementDescriptor {
    protected elements: Map<LogicElement["ptr"], LogicElement>;
    protected callSites: Map<string, RoutineDef>;
    protected classDefs: Map<string, number>;
    protected methodDefs: Map<string, MethodDef>;
    protected eventsDefs: Map<string, EventDef>;
    protected stateDef: Map<string, number>;
    constructor(elements: LogicElement[]);
    /**
     * Retrieves a LogicElement from the elements map using the provided pointer.
     *
     * @param ptr - The pointer to the LogicElement to retrieve.
     * @returns The LogicElement associated with the provided pointer.
     *
     * @throws Will throw an error if the element with the specified pointer is not found.
     */
    getElement(ptr: number): LogicElement;
    /**
     * Retrieves the map of logic elements.
     *
     * @returns {Map<number, LogicElement>} A map where the keys are numbers and the values are LogicElement instances.
     */
    getElements(): Map<number, LogicElement>;
    /**
     * Retrieves the call sites associated with this manifest.
     *
     * @returns {Map<string, RoutineDef>} A map where the keys are strings representing the call site identifiers and the values are `RoutineDef` objects defining the routines.
     */
    getCallsites(): Map<string, RoutineDef>;
    /**
     * Retrieves the class definitions.
     *
     * @returns {Map<string, number>} A map where the keys are class names (strings) and the values are class definitions (numbers).
     */
    getClassDefs(): Map<string, number>;
    /**
     * Retrieves the map of event definitions.
     *
     * @returns {Map<string, EventDef>} A map where the keys are event names and the values are event definitions.
     */
    getEvents(): Map<string, EventDef>;
    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    getMethodDefs(): Map<string, MethodDef>;
    /**
     * Retrieves the methods of a specified class.
     *
     * @param className - The name of the class whose methods are to be retrieved.
     * @returns A map where the keys are method names and the values are `ElementData` objects representing the methods.
     * @throws Will throw an error if the class name is invalid.
     */
    getClassMethods(className: string): Map<string, ElementData<ElementType.Method>>;
    /**
     * Retrieves a routine element by its name.
     *
     * @param name - The name of the routine element to retrieve.
     * @returns The routine element associated with the given name.
     * @throws Will throw an error if the routine name is not found.
     */
    getRoutineElement(name: string): Element<ElementType.Routine>;
    /**
     * Retrieves a class element by its name.
     *
     * @param className - The name of the class to retrieve.
     * @returns The class element associated with the given name.
     * @throws Will throw an error if the class name is invalid
     */
    getClassElement(className: string): Element<ElementType.Class>;
    getMethodElement(methodName: string): Element<ElementType.Method>;
    /**
     * Retrieves the element from the logic manifest based on the given
     * event name.
     *
     * @param {string} eventName - The name of the event.
     * @returns {LogicManifest.Element<LogicManifest.Event>} The event element.
     *
     * @throws {Error} if the event name is invalid.
     */
    getEventElement(eventName: string): Element<ElementType.Event>;
}
//# sourceMappingURL=element-descriptor.d.ts.map