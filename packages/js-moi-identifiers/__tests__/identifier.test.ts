import { Identifier, IdentifierKind, IdentifierTag } from "../src.ts";
import { hexToBytes } from "../src.ts/utils";

const ASSET_ID = "0x108000004cd973c4eb83cdb8870c0de209736270491b7acc99873da100000000";
const LOGIC_ID = "0x208300005edd2b54c4b613883b3eaf5d52d22d185e1d001a023e3f7800000000";
const PARTICIPANT_ID = "0x0000000037a3bb2970b6250a7b845abafc87df6ae06f8d84640c2ee600000000";

describe(Identifier, () => {
    describe.each([
        { kind: IdentifierKind.Asset, identifier: new Identifier(ASSET_ID), value: ASSET_ID },
        { kind: IdentifierKind.Logic, identifier: new Identifier(LOGIC_ID), value: LOGIC_ID },
        { kind: IdentifierKind.Participant, identifier: new Identifier(PARTICIPANT_ID), value: PARTICIPANT_ID },
    ])(`${Identifier.name} for identifier kind ($kind)`, ({ identifier, value, kind }) => {
        describe(identifier.getFingerprint, () => {
            it.concurrent("should return a fingerprint", () => {
                expect(identifier.getFingerprint()).toEqual(hexToBytes(value).slice(4, 28));
            });
        });

        describe(identifier.getVariant, () => {
            it.concurrent("should return a variant", () => {
                expect(typeof identifier.getVariant()).toBe("number");
            });
        });

        describe(identifier.getTag, () => {
            it.concurrent("should return an identifier tag", () => {
                expect(identifier.getTag()).toBeInstanceOf(IdentifierTag);
                expect(identifier.getTag().getKind()).toBe(kind);
            });
        });

        describe(identifier.toString, () => {
            it.concurrent("should return a string representation", () => {
                expect(identifier.toString()).toBe(value);
            });
        });
    });
});
