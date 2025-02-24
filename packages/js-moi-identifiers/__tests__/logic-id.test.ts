import { Identifier, IdentifierKind, LogicId } from "../src.ts";
import { hexToBytes } from "../src.ts/utils";

const NOT_A_LOGIC_ID = "0x0000000067bc504a470c5e31586eeedbefe73ccef20e0a49e1dc75ed00000000";
const TEST_LOGIC_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";

describe(LogicId, () => {
    describe("constructor", () => {
        it.concurrent("should throw error for invalid logic id", () => {
            expect(() => new LogicId(NOT_A_LOGIC_ID)).toThrow();
        });

        it.concurrent("should throw error if identifier kind is not logic", () => {
            expect(() => new LogicId(new Identifier(NOT_A_LOGIC_ID))).toThrow();
        });

        it.concurrent("should create instance for valid logic id", () => {
            const logicId = new LogicId(TEST_LOGIC_ID);

            expect(logicId).toBeInstanceOf(LogicId);
            expect(logicId.getTag().getKind()).toBe(IdentifierKind.Logic);
            expect(logicId.getFingerprint()).toEqual(hexToBytes(TEST_LOGIC_ID).slice(4, 28));
            expect(logicId.getVariant()).toBe(0);
        });
    });

    describe(LogicId.validate, () => {
        it.concurrent("should return null for valid logic id", () => {
            expect(LogicId.validate(TEST_LOGIC_ID)).toBeNull();
        });

        it.concurrent("should return error for invalid logic id", () => {
            expect(LogicId.validate(NOT_A_LOGIC_ID)).not.toBeNull();
        });
    });
});
