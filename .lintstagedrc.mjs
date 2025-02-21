/** @type {import('./lib/types').Configuration} */
export default {
    "*.{ts,d.ts}": ["eslint --fix", "prettier --write"],
    "*.json": ["prettier --write"],
};
