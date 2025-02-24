import * as deepmerge from "deepmerge";
import type { Config } from "jest";

const runNetworkTest = process.env.RUN_NETWORK_TEST === "true";

interface Package {
    name: string;
    run_tests: boolean;
    config?: Config;
}

/**
 * Retrieves an array of package configurations.
 *
 * Each package configuration includes the package name and a flag indicating
 * whether tests should be run for that package.
 *
 * The `config` property can be used to provide a custom Jest configuration which
 * will override the shared configuration.
 *
 * @returns {Package[]} An array of package configurations.
 */
const getPackages = (): Package[] => [
    {
        name: "js-moi-bip39",
        run_tests: true,
    },
    {
        name: "js-moi-hdnode",
        run_tests: true,
    },
    {
        name: "js-moi-identifiers",
        run_tests: true,
    },
    {
        name: "js-moi-manifest",
        run_tests: true,
    },
    {
        name: "js-moi-logic",
        run_tests: !true,
    },
    {
        name: "js-moi-signer",
        run_tests: true,
    },
    {
        name: "js-moi-providers",
        run_tests: true,
    },
    {
        name: "js-moi-utils",
        run_tests: true,
    },
    {
        name: "js-moi-wallet",
        run_tests: true,
    },
];

const getSharedConfiguration = (pkg: Package): Config => {
    return {
        transform: { "^.+.tsx?$": ["ts-jest", {}] },
        displayName: pkg.name,
        testMatch: [`<rootDir>/packages/${pkg.name}/__tests__/*.test.ts`],
    };
};

const getPackageConfiguration = (pkg: Package): Config => {
    const shared: Config = getSharedConfiguration(pkg);
    const config: Config = pkg.config ?? {};

    return deepmerge.all<Config>([shared, config]);
};

const getProjects = () => {
    return getPackages()
        .filter((pkg) => pkg.run_tests)
        .map((pkg) => getPackageConfiguration(pkg));
};

const config: Config = {
    clearMocks: true,
    ci: process.env.CI === "true",
    globalSetup: runNetworkTest ? "<rootDir>/jest.setup.ts" : null,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["html", "text-summary"],
    coverageProvider: "v8",
    detectLeaks: true,
    verbose: true,
    workerThreads: true,
    maxConcurrency: 50,
    maxWorkers: "100%",
    coveragePathIgnorePatterns: ["<rootDir>/packages/*/__tests__/.+"],
    projects: getProjects(),
};

export default config;
