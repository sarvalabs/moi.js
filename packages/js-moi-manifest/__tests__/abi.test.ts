import { randomBytes } from "node:crypto";
import manifest from "../manifests/erc20.json";
import { ManifestCoder } from "../src/manifest-coder";
import { LogicManifest } from "../types/manifest";

describe("Test ManifestCoder", () => {
    const manifestCoder = new ManifestCoder(manifest);

    test("Encode ABI/Manifest into polo format", () => {
        const encodedABI = ManifestCoder.encodeManifest(manifest);
        expect(encodedABI).toBe(
            "0x0e4f065ede01302e312e302f064e504953410fef030e8e13fe25ae29fe2cae359e3e8e48ae51de5d9e6ede84019e9b019eac014f0300065e73746174653f06ae0170657273697374656e749f010eee01fe03de05ae093f0306466e616d65737472696e673f0316760173796d626f6c737472696e673f03167602737570706c797536344f031696010362616c616e6365736d61705b616464726573735d7536344f0316b60104616c6c6f77616e6365736d61705b616464726573735d6d61705b616464726573735d7536345f031e36ae01011f03726f7574696e65af010676fe01e00aee0ab00f536565646572216465706c6f7965727f0eee01fe03de053f0306466e616d65737472696e673f0316760173796d626f6c737472696e673f03167602737570706c797536343f03167603736565646572616464726573735f06f603f003040000810000040001810001040002810002800103040203540102008101035f0310169e0102636f6e7374616e742f06367536343078303330615f031016860103747970656465666d61705b616464726573735d7536345f031e36ae01041f03726f7574696e65af010646d001de01de03f0044e616d65696e766f6b61626c651f0e3f0306466e616d65737472696e673f0666608000000500005f031e36ae01051f03726f7574696e65af010666f001fe019e04b00553796d626f6c696e766f6b61626c651f0e3f03066673796d626f6c737472696e673f0666608000010500005f031e36ae01061f03726f7574696e65bf0106860190029e02be04a006446563696d616c73696e766f6b61626c651f0e4f03068601646563696d616c737536345f06960190011100021000000500005f031e36ae01071f03726f7574696e65bf0106b601c002ce02be04d005546f74616c537570706c79696e766f6b61626c651f0e3f030666737570706c797536343f0666608000020500005f031e36ae01081f03726f7574696e65bf01069601ae02be04be06e00842616c616e63654f66696e766f6b61626c651f0e3f03064661646472616464726573731f0e3f03067662616c616e63657536345f06d601d001800003040100530200010502005f031e36ae01091f03726f7574696e65bf01069601ae02ae07de09f00c416c6c6f77616e6365696e766f6b61626c653f0e8e023f0306566f776e6572616464726573734f03168601017370656e646572616464726573731f0e4f03069601616c6c6f77616e63657536345f06c602c00280000404010053020001040301530402030504005f031e56ce010a2f030303726f7574696e65bf010686019e029e09de0ad012417070726f766521696e766f6b61626c655f0e8e02ce043f0306566f776e6572616464726573734f03168601017370656e646572616464726573733f03167602616d6f756e747536341f0e3f0306266f6b626f6f6c5f06a607a0078000040401005302000120030262030311040a0304031104002804042402040104030104040254020304540001028100042900016200000500005f031e36ae010b1f03726f7574696e65bf01069601ae02be08fe09f0125472616e7366657221696e766f6b61626c655f0efe01de033f03064666726f6d616464726573733f03163601746f616464726573733f03167602616d6f756e747536341f0e3f0306266f6b626f6f6c5f06a608a008800003040100530200010403024404030211050a030504290001050000000166040203540001040405015304000565060403540005068100032900016200000500005f031e36ae010c1f03726f7574696e65af010656ee01fe05be07c00d4d696e7421696e766f6b61626c653f0ede013f030666616d6f756e747536343f0316560161646472616464726573731f0e3f0306266f6b626f6f6c5f06b605b005800002040100650000018100028000030402015303000265030301540002038100032900016200000500005f031e36ae010d1f03726f7574696e65af010656ee01fe05be07e00f4275726e21696e766f6b61626c653f0ede013f030666616d6f756e747536343f0316560161646472616464726573731f0e3f0306266f6b626f6f6c5f06d607d007800003040101530200010403004404030211050a0305042900010500000001660402035400010481000380000266000003810002290001620000050000"
        );
    });

    describe("Encode arguments into polo format", () => {
        const routineName = "Seeder!";
        const args = ["MOI-Token", "MOI", 100000000, "ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34"];
        const output =
            "0x0def010645e601c502d606b5078608e5086e616d65064d4f492d546f6b656e73656564657206ffcd8ee6a29ec442dbbf9c6124dd3aeb833ef58052237d521654740857716b34737570706c790305f5e10073796d626f6c064d4f49";

        test("it should encode arguments when field is provided as array of type of argument", () => {
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === routineName;
            });

            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.accepts ? routine.accepts : [];
            const calldata = manifestCoder.encodeArguments(fields, args);

            expect(routine).toBeDefined();
            expect(calldata).toBe(output);
        });

        test("it should encode arguments when field is routine name", () => {
            const result = manifestCoder.encodeArguments(routineName, args);

            expect(result).toBe(output);
        });

        test("it should throw an error when routine is not found", () => {
            const routineName = randomBytes(16).toString("utf-8");

            expect(() => manifestCoder.encodeArguments(routineName, args)).toThrow();
        });
    });

    describe("Decode POLO encoded ouput", () => {
        type Output = { balance: number };
        const encodedOutput = "0x0e1f0305f5e100";
        const decodedOutput: Output = { balance: 100000000 };
        const routineName = "BalanceOf";

        test("it should be able to decode when field is provided as type of arguments", () => {
            const routineElement = manifest.elements.find((element: LogicManifest.Element) => {
                element.data = element.data as LogicManifest.Routine;
                return element.data.name === routineName;
            });

            const routine = routineElement?.data as LogicManifest.Routine;
            const fields = routine.returns ? routine.returns : [];
            const output = manifestCoder.decodeOutput<Output>(encodedOutput, fields);

            expect(output).toEqual(decodedOutput);
        });

        test("it should be able to decode when field is routine name", () => {
            const output = manifestCoder.decodeOutput<Output>(encodedOutput, routineName);

            expect(output).toEqual(decodedOutput);
        });

        test("it should throw an error when routine is not found", () => {
            const routineName = randomBytes(16).toString("utf-8");

            expect(() => manifestCoder.decodeOutput(routineName, encodedOutput)).toThrow();
        });

        test("it should return null when output is '0x'", () => {
            const output = manifestCoder.decodeOutput("0x", routineName);

            expect(output).toBeNull();
        });
    });

    test("Decode polo encoded exception", () => {
        const error = "0x0e4f0666ae03737472696e67536f6d657468696e672077656e742077726f6e673f06b60166756e6374696f6e31282966756e6374696f6e322829";
        const exception = ManifestCoder.decodeException(error);

        expect(exception).toEqual({
            class: "string",
            data: "Something went wrong",
            trace: ["function1()", "function2()"],
        });
    });

    test("Decode polo encoded property of a state", () => {
        const data = "0x0652494f";

        const state: any = manifest.elements.find((element) => element.kind === "state");

        const output = manifestCoder.decodeState(data, "name", state?.data.fields);
        expect(output).toBe("RIO");
    });
});
