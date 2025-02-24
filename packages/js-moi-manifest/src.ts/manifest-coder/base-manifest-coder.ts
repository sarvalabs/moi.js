import type { LogicManifest } from "js-moi-utils";

export abstract class BaseManifestCoder {
    protected validate(manifest: unknown): manifest is LogicManifest {
        if (typeof manifest !== "object" || manifest === null) {
            return false;
        }

        if (!("elements" in manifest) || !Array.isArray(manifest.elements)) {
            return false;
        }

        return true;
    }
}
