import type { LogicManifest } from "js-moi-utils";
import fs from "node:fs/promises";
import path from "node:path";

export const loadFile = async (filepath: string) => {
    const file = path.resolve(__dirname, filepath);
    return await fs.readFile(file, "utf8");
};

export const loadManifestFromFile = async (filepath: string): Promise<LogicManifest> => {
    const blob = await loadFile(filepath);
    return JSON.parse(blob);
};
