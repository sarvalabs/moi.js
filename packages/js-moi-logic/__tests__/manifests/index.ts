import type { LogicManifest } from "js-moi-utils";

import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Loads a logic manifest from a JSON file.
 *
 * @param name - The name of the manifest file (without the .json extension).
 * @returns A promise that resolves to the parsed LogicManifest object.
 *
 * @throws Will throw an error if the file cannot be read or the content cannot be parsed as JSON.
 */
export const loadManifestFromFile = (name: string): LogicManifest => {
    const filePath = path.join(__dirname, `${name}.json`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
};
