import type { LogicManifest } from "../../types/manifest";
import { BaseManifestSerializer } from "./base-manifest-serializer";
export declare class JsonManifestSerializer extends BaseManifestSerializer {
    private static MANIFEST_SCHEMA;
    private static readonly SCHEMA_CONFIG;
    /**
     * Serializes a given LogicManifest.Element into a Polorizer instance.
     *
     * @param element - The LogicManifest.Element to be serialized.
     * @returns A Polorizer instance containing the serialized data.
     *
     * @throws Will throw an error if the element kind is unknown.
     */
    private serializeElement;
    private deserializeElement;
    /**
     * Serializes an array of elements from the given manifest.
     *
     * @param {LogicManifest.Manifest} manifest - The manifest containing the elements to be serialized.
     * @returns - The polorizer containing the serialized elements.
     */
    private serializeElementArray;
    private deserializeElements;
    /**
     * Serializes a given LogicManifest.Manifest object into a POLO Uint8Array.
     *
     * @param {LogicManifest.Manifest} manifest - The manifest object to be serialized.
     * @returns {Uint8Array} The POLO serialized manifest as a Uint8Array.
     * @throws {Error} If the manifest is invalid.
     */
    serialize(manifest: LogicManifest.Manifest): Uint8Array;
    private getPoloBytes;
    deserialize(data: string | Uint8Array): LogicManifest.Manifest;
}
//# sourceMappingURL=json-manifest-serializer.d.ts.map