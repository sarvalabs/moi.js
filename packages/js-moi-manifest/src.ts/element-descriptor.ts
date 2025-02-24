import { Element, ElementType, ErrorCode, ErrorUtils, type ElementData, type LogicElement } from "js-moi-utils";
import type { EventDef, MethodDef, RoutineDef } from "./types/manifest";

/**
 * This class represents a descriptor for elements in the logic manifest.
 */
export class ElementDescriptor {
    protected elements: Map<LogicElement["ptr"], LogicElement> = new Map();
    protected callSites: Map<string, RoutineDef> = new Map();
    protected classDefs: Map<string, number> = new Map();
    protected methodDefs: Map<string, MethodDef> = new Map();
    protected eventsDefs: Map<string, EventDef> = new Map();
    protected stateDef: Map<string, number> = new Map();

    constructor(elements: LogicElement[]) {
        for (const element of elements) {
            this.elements.set(element.ptr, element);

            switch (element.kind) {
                case ElementType.Class:
                    this.classDefs.set("class." + element.data.name, element.ptr);
                    break;

                case ElementType.Method:
                    this.methodDefs.set(element.data.name, {
                        ptr: element.ptr,
                        class: element.data.class,
                    });
                    break;

                case ElementType.Routine:
                    this.callSites.set(element.data.name, {
                        ptr: element.ptr,
                        kind: element.data.kind,
                    });
                    break;

                case ElementType.Event:
                    this.eventsDefs.set(element.data.name, {
                        ptr: element.ptr,
                        topics: element.data.topics,
                    });
                    break;
                default:
                    break;
            }
        }
    }

    /**
     * Retrieves a LogicElement from the elements map using the provided pointer.
     *
     * @param ptr - The pointer to the LogicElement to retrieve.
     * @returns The LogicElement associated with the provided pointer.
     *
     * @throws Will throw an error if the element with the specified pointer is not found.
     */
    public getElement(ptr: number): LogicElement {
        const elm = this.elements.get(ptr);

        if (elm == null) {
            return ErrorUtils.throwError(`Element with pointer ${ptr} not found.`, ErrorCode.NOT_FOUND);
        }

        return elm;
    }

    /**
     * Retrieves the map of logic elements.
     *
     * @returns {Map<number, LogicElement>} A map where the keys are numbers and the values are LogicElement instances.
     */
    public getElements(): Map<number, LogicElement> {
        return this.elements;
    }

    /**
     * Retrieves the call sites associated with this manifest.
     *
     * @returns {Map<string, RoutineDef>} A map where the keys are strings representing the call site identifiers and the values are `RoutineDef` objects defining the routines.
     */
    public getCallsites(): Map<string, RoutineDef> {
        return this.callSites;
    }

    /**
     * Retrieves the class definitions.
     *
     * @returns {Map<string, number>} A map where the keys are class names (strings) and the values are class definitions (numbers).
     */
    public getClassDefs(): Map<string, number> {
        return this.classDefs;
    }

    /**
     * Retrieves the map of event definitions.
     *
     * @returns {Map<string, EventDef>} A map where the keys are event names and the values are event definitions.
     */
    public getEvents(): Map<string, EventDef> {
        return this.eventsDefs;
    }

    /**
     * Retrieves the map of method definitions associated with the ElementDescriptor.
     *
     * @returns {Map<string, MethodDef>} The method definitions map.
     */
    public getMethodDefs(): Map<string, MethodDef> {
        return this.methodDefs;
    }

    /**
     * Retrieves the methods of a specified class.
     *
     * @param className - The name of the class whose methods are to be retrieved.
     * @returns A map where the keys are method names and the values are `ElementData` objects representing the methods.
     * @throws Will throw an error if the class name is invalid.
     */
    public getClassMethods(className: string): Map<string, ElementData<ElementType.Method>> {
        const classPtr = this.classDefs.get(className);

        if (classPtr === undefined) {
            return ErrorUtils.throwError(`Invalid class name: ${className}`, ErrorCode.INVALID_ARGUMENT);
        }

        const classMethods: Map<string, ElementData<ElementType.Method>> = new Map();

        this.methodDefs.forEach((method, methodName) => {
            if (method.class === className) {
                const element = this.elements.get(method.ptr);

                if (element == null || element.kind !== ElementType.Method) {
                    return;
                }

                classMethods.set(methodName, element.data);
            }
        });

        return classMethods;
    }

    /**
     * Retrieves a routine element by its name.
     *
     * @param name - The name of the routine element to retrieve.
     * @returns The routine element associated with the given name.
     * @throws Will throw an error if the routine name is not found.
     */
    public getRoutineElement(name: string): Element<ElementType.Routine> {
        const callsite = this.callSites.get(name);

        if (!callsite) {
            ErrorUtils.throwError(`Routine name "${name}" not found.`, ErrorCode.NOT_FOUND);
        }

        const element = this.getElement(callsite.ptr);

        if (element.kind !== ElementType.Routine) {
            ErrorUtils.throwError(`Element is not a routine: ${name}`, ErrorCode.UNKNOWN_ERROR);
        }

        return element;
    }

    /**
     * Retrieves a class element by its name.
     *
     * @param className - The name of the class to retrieve.
     * @returns The class element associated with the given name.
     * @throws Will throw an error if the class name is invalid
     */
    public getClassElement(className: string): Element<ElementType.Class> {
        const ptr = this.classDefs.get(className);

        if (ptr === undefined) {
            return ErrorUtils.throwError(`Class name "${className}" not found.`, ErrorCode.NOT_FOUND);
        }

        const element = this.getElement(ptr);

        if (element.kind !== ElementType.Class) {
            return ErrorUtils.throwError(`Element is not a class: ${className}`, ErrorCode.UNKNOWN_ERROR);
        }

        return element;
    }

    public getMethodElement(methodName: string): Element<ElementType.Method> {
        const methodDef = this.methodDefs.get(methodName);

        if (methodDef == null) {
            ErrorUtils.throwError(`Method name "${methodName}" not found.`, ErrorCode.NOT_FOUND);
        }

        const element = this.getElement(methodDef.ptr);

        if (element.kind !== ElementType.Method) {
            ErrorUtils.throwError(`Element is not a method: ${methodName}`, ErrorCode.UNKNOWN_ERROR);
        }

        return element;
    }

    /**
     * Retrieves the element from the logic manifest based on the given
     * event name.
     *
     * @param {string} eventName - The name of the event.
     * @returns {LogicManifest.Element<LogicManifest.Event>} The event element.
     *
     * @throws {Error} if the event name is invalid.
     */
    public getEventElement(eventName: string): Element<ElementType.Event> {
        const eventDef = this.eventsDefs.get(eventName);

        if (!eventDef) {
            ErrorUtils.throwError(`Event name "${eventName}" not found.`, ErrorCode.NOT_FOUND);
        }

        const element = this.getElement(eventDef.ptr);

        if (element.kind !== ElementType.Event) {
            return ErrorUtils.throwError(`Element is not an event: ${eventName}`, ErrorCode.UNKNOWN_ERROR);
        }

        return element;
    }
}
