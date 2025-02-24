import { ElementType, LogicManifest, type LogicElement } from "js-moi-utils";
import { Schema } from "../src.ts/schema";
import { loadManifestFromFile } from "./utils/helper";

describe("Test Schema", () => {
    const elements = new Map();
    const classDefs = new Map();
    let manifest: LogicManifest;

    beforeAll(async () => {
        manifest = await loadManifestFromFile("../../manifests/tokenledger.json");
        manifest.elements.forEach((element: LogicElement) => {
            elements.set(element.ptr, element);

            if (element.kind === ElementType.Class) {
                classDefs.set(element.data.name, element.ptr);
            }
        });
    });

    const schema = new Schema(elements, classDefs);

    test("Parse fields and create schema", () => {
        const state = manifest.elements.find((element) => element.kind === ElementType.State);

        if (!state) {
            throw new Error("State not found");
        }

        const stateSchema = schema.parseFields(state.data.fields);

        expect(stateSchema).toEqual({
            kind: "struct",
            fields: {
                Symbol: { kind: "string" },
                Supply: { kind: "integer" },
                Balances: {
                    kind: "map",
                    fields: {
                        keys: {
                            kind: "bytes",
                        },
                        values: {
                            kind: "integer",
                        },
                    },
                },
            },
        });
    });
});
