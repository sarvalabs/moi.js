import { LogicId } from "js-moi-identifiers";
import { ManifestCoder, ManifestCoderFormat } from "js-moi-manifest";
import { ElementType, EngineKind, isHex, LogicState, type Hex, type LogicManifest } from "js-moi-utils";
import { parse } from "yaml";
import { LogicDescriptor } from "../src.ts";
import { loadManifestFromFile } from "./manifests";

const manifests = [
    {
        name: "tokenledger",
        isEphemeral: false,
        isPersistent: true,
        kind: EngineKind.PISA,
    },
    {
        name: "lockledger",
        isEphemeral: true,
        isPersistent: true,
        kind: EngineKind.PISA,
    },
    {
        name: "flipper",
        isEphemeral: false,
        isPersistent: true,
        kind: EngineKind.MERU,
    },
];

describe.each(manifests)(`${LogicDescriptor.name} of manifest "$name"`, (manifest) => {
    const descriptor = new LogicDescriptor(loadManifestFromFile(manifest.name));

    describe(descriptor.getEngine, () => {
        it.concurrent("should get manifest engine", async () => {
            const engine = descriptor.getEngine();

            expect(engine).toBeDefined();
            expect(engine.kind).toBe(manifest.kind);
            expect(engine.kind in EngineKind).toBe(true);
            expect(Array.isArray(engine.flags)).toBe(true);
        });
    });

    describe(descriptor.getSyntax, () => {
        it.concurrent("should get manifest syntax", async () => {
            const syntax = descriptor.getSyntax();

            expect(syntax).toBeDefined();
            expect(syntax).toBe(1);
        });
    });

    it.concurrent("should return a instance of ManifestCoder", () => {
        const coder = descriptor.getManifestCoder();

        expect(coder).toBeDefined();
        expect(coder).toBeInstanceOf(ManifestCoder);
    });

    describe("if logic id is defined", () => {
        const value = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

        beforeAll(() => {
            descriptor["setLogicId"](new LogicId(value));
        });

        afterAll(() => {
            descriptor["logicId"] = undefined;
        });

        describe(descriptor.getLogicId, () => {
            it("should return logic id", async () => {
                const logicId = await descriptor.getLogicId();

                expect(logicId).toBeDefined();
                expect(logicId).toBeInstanceOf(LogicId);
                expect(logicId.toString()).toBe(value);
            });
        });
    });

    describe(descriptor.isEphemeral, () => {
        it.concurrent(`should return a boolean value of ${manifest.isEphemeral}`, () => {
            const result = descriptor.isEphemeral();

            expect(result).toBeDefined();
            expect(result).toBe(manifest.isEphemeral);
        });
    });

    describe(descriptor.isPersistent, () => {
        it.concurrent(`should return a boolean value of ${manifest.isPersistent}`, () => {
            const result = descriptor.isPersistent();

            expect(result).toBeDefined();
            expect(result).toBe(manifest.isPersistent);
        });
    });

    describe(descriptor.getManifest, () => {
        it.concurrent.each([
            {
                case: "if format is not passed",
                callback: () => descriptor.getManifest(undefined!),
            },
            {
                case: "if format is invalid",
                callback: () => descriptor.getManifest("invalid" as any),
            },
        ])("should throw error if $case", ({ callback }) => {
            expect(callback).toThrow();
        });

        it.concurrent.each([
            {
                format: ManifestCoderFormat.JSON,
                verify: (manifest: LogicManifest) => {
                    expect(manifest).toBeDefined();
                    expect(typeof manifest).toBe("object");
                },
            },
            {
                format: ManifestCoderFormat.YAML,
                verify: (manifest: string) => {
                    expect(manifest).toBeDefined();
                    expect(typeof manifest).toBe("string");
                    expect(() => parse(manifest)).not.toThrow();
                },
            },
            {
                format: ManifestCoderFormat.POLO,
                verify: (manifest: Hex) => {
                    expect(manifest).toBeDefined();
                    expect(isHex(manifest)).toBeTruthy();
                },
            },
        ])(`should return manifest in $format format`, async ({ format, verify }) => {
            const manifest: any = descriptor.getManifest(format as any);

            verify(manifest);
        });
    });

    describe(descriptor.getStateElement, () => {
        it.concurrent.each([
            { state: LogicState.Ephemeral, shouldExist: manifest.isEphemeral },
            { state: LogicState.Persistent, shouldExist: manifest.isPersistent },
        ])("should return state element if state is $state", async ({ state, shouldExist }) => {
            if (shouldExist) {
                const element = descriptor.getStateElement(state);

                expect(element).toBeDefined();
                expect(element.kind).toBe(ElementType.State);
            } else {
                expect(() => descriptor.getStateElement(state)).toThrow();
            }
        });
    });
});
