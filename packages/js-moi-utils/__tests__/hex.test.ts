import { bytesToHex, encodeToString, hexToBN, hexToBytes, isAddress, isHex, numToHex, toQuantity, trimHexPrefix } from "../src.ts/hex";

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

describe(numToHex.name, () => {
    test("should convert a positive number to a hexadecimal string", () => {
        const value = randomInt(0, 1000000000);
        expect(numToHex(value)).toBe(`0x${value.toString(16)}`);
    });

    test("should convert a positive bigint to a hexadecimal string", () => {
        const value = BigInt(randomInt(0, 1000000000));
        expect(numToHex(value)).toBe(`0x${value.toString(16)}`);
    });

    test("should throw an error for a negative number", () => {
        const value = randomInt(0, 1000000000);
        expect(() => numToHex(-value)).toThrow("Input must be a positive BN value");
    });

    test("should have hex prefix in a result", () => {
        const value = randomInt(0, 1000000000);
        expect(numToHex(value)).toMatch(/^0x/);
    });
});

describe(toQuantity.name, () => {
    test("should convert a positive number to a quantity string", () => {
        const value = randomInt(0, 1000000000);
        expect(toQuantity(value)).toBe(`0x${value.toString(16)}`);
    });

    test("should convert a positive bigint to a quantity string", () => {
        const value = BigInt(randomInt(0, 1000000000));
        expect(toQuantity(value)).toBe(`0x${value.toString(16)}`);
    });

    test("should throw an error for a negative number", () => {
        expect(() => toQuantity(-123)).toThrow("Input must be a positive BN value");
    });
});

describe(encodeToString.name, () => {
    test("should encode a Uint8Array to a hexadecimal string", () => {
        const data = new Uint8Array([1, 2, 3, 4]);
        expect(encodeToString(data)).toBe("0x01020304");
    });
});

describe(hexToBytes, () => {
    test("should convert a valid hexadecimal string to Uint8Array", () => {
        expect(hexToBytes("0x01020304")).toEqual(new Uint8Array([1, 2, 3, 4]));
    });

    test("should throw an error for an invalid hexadecimal string", () => {
        expect(() => hexToBytes("0x123")).toThrow("Invalid hex string");
    });
});

describe(hexToBN.name, () => {
    test("should convert a hexadecimal string to a bigint", () => {
        expect(hexToBN("0x123")).toBe(291);
    });

    test("should convert a large hexadecimal string to a bigint", () => {
        const largeHex = "0x" + "1".repeat(100); // A large hex string
        const expectedValue = BigInt("0x" + "1".repeat(100));
        expect(hexToBN(largeHex)).toBe(expectedValue);
    });

    test("should convert a small hexadecimal string to a number", () => {
        expect(hexToBN("0x1234")).toBe(4660);
    });
});

describe(bytesToHex.name, () => {
    test("should convert a Uint8Array to a hexadecimal string", () => {
        const data = new Uint8Array([1, 2, 3, 4]);
        expect(bytesToHex(data)).toBe("0x01020304");
    });
});

describe(isHex.name, () => {
    describe("if length is not provided", () => {
        const testCases = [
            {
                input: "0x1234ABCD",
                expected: true,
                message: "should return true for a valid hexadecimal string",
            },
            {
                input: "12345G",
                expected: false,
                message: "should return false for an invalid hexadecimal string",
            },
            {
                input: 12345,
                expected: false,
                message: "should return false for a non-string value",
            },
            {
                input: "",
                expected: false,
                message: "should return false for an empty string",
            },
            {
                input: "1234ABCD",
                expected: false,
                message: "should return false for a string without the '0x' prefix",
            },
            {
                input: "0x",
                expected: false,
                message: "should return false for string with '0x' only",
            },
            {
                input: "0x123",
                expected: true,
                message: "should return true for a valid short hexadecimal string",
            },
            {
                input: "0x1234567890abcdef",
                expected: true,
                message: "should return true for a valid long hexadecimal string",
            },
            {
                input: "0x1234567890ABCDEF",
                expected: true,
                message: "should return true for a valid long uppercase hexadecimal string",
            },
            {
                input: "0x1234567890abcdeg",
                expected: false,
                message: "should return false for a string with invalid characters",
            },
            {
                input: "0x1234567890abcdefg",
                expected: false,
                message: "should return false for a string with invalid characters at the end",
            },
            {
                input: "0x1234567890abcdeff",
                expected: true,
                message: "should return true for a valid hexadecimal string with an even length",
            },
            {
                input: "0x1234567890abcdef0",
                expected: true,
                message: "should return true for a valid hexadecimal string with a trailing zero",
            },
        ];

        for (const testcase of testCases) {
            test(testcase.message, () => {
                expect(isHex(testcase.input)).toBe(testcase.expected);
            });
        }
    });

    describe("if length is provided", () => {
        const testCasesWithLength = [
            {
                input: "0x1234ABCD",
                length: 4,
                expected: true,
                message: "should return true for a valid hexadecimal string of correct length",
            },
            {
                input: "0x1234ABCD",
                length: 3,
                expected: false,
                message: "should return false for a valid hexadecimal string of incorrect length",
            },
            {
                input: "0x12345G",
                length: 3,
                expected: false,
                message: "should return false for an invalid hexadecimal string of correct length",
            },
            {
                input: "0x1234",
                length: 2,
                expected: true,
                message: "should return true for a valid short hexadecimal string of correct length",
            },
            {
                input: "0x1234",
                length: 3,
                expected: false,
                message: "should return false for a valid short hexadecimal string of incorrect length",
            },
        ];

        for (const testcase of testCasesWithLength) {
            test(testcase.message, () => {
                expect(isHex(testcase.input, testcase.length)).toBe(testcase.expected);
            });
        }
    });
});

describe(trimHexPrefix.name, () => {
    test("should remove the '0x' prefix from a hexadecimal string", () => {
        expect(trimHexPrefix("0xABCDEF")).toBe("ABCDEF");
    });

    test("should not remove the '0x' prefix from a non-hexadecimal string", () => {
        expect(trimHexPrefix("0x12345G")).toBe("0x12345G");
    });
});

describe(isAddress.name, () => {
    test("should return true for a valid address", () => {
        const address = bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(32)));
        expect(isAddress(address)).toBe(true);
    });

    test("should return false for an invalid address", () => {
        const address = bytesToHex(globalThis.crypto.getRandomValues(new Uint8Array(12)));
        expect(isAddress(address)).toBe(false);
    });
});
