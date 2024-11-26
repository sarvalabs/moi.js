import { bytesToHex, encodeToString, hexToBN, hexToBytes, isHex, numToHex, toQuantity, trimHexPrefix } from "../src.ts/hex";

describe("numToHex", () => {
  test("should convert a positive number to a hexadecimal string", () => {
    expect(numToHex(123)).toBe("7B");
  });

  test("should convert a positive bigint to a hexadecimal string", () => {
    expect(numToHex(BigInt("9007199254740991"))).toBe("1FFFFFFFFFFFFF");
  });

  test("should throw an error for a negative number", () => {
    expect(() => numToHex(-123)).toThrow("Input must be a positive BN value");
  });
});

describe("toQuantity", () => {
  test("should convert a positive number to a quantity string", () => {
    expect(toQuantity(123)).toBe("0x7B");
  });

  test("should convert a positive bigint to a quantity string", () => {
    expect(toQuantity(BigInt("9007199254740991"))).toBe("0x1FFFFFFFFFFFFF");
  });

  test("should throw an error for a negative number", () => {
    expect(() => toQuantity(-123)).toThrow("Input must be a positive BN value");
  });
});

describe("encodeToString", () => {
  test("should encode a Uint8Array to a hexadecimal string", () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    expect(encodeToString(data)).toBe("0x01020304");
  });
});

describe("hexToBytes", () => {
  test("should convert a valid hexadecimal string to Uint8Array", () => {
    expect(hexToBytes("0x01020304")).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  test("should throw an error for an invalid hexadecimal string", () => {
    expect(() => hexToBytes("0x123")).toThrow("Invalid hex string");
  });
});

describe("hexToBN", () => {
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

describe("bytesToHex", () => {
  test("should convert a Uint8Array to a hexadecimal string", () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    expect(bytesToHex(data)).toBe("01020304");
  });
});

describe("isHex", () => {
  test("should return true for a valid hexadecimal string", () => {
    expect(isHex("0x1234ABCD")).toBe(true);
  });

  test("should return false for an invalid hexadecimal string", () => {
    expect(isHex("12345G")).toBe(false);
  });

  test("should return false for a non-string value", () => {
    expect(isHex(123)).toBe(false);
  });
});

describe("trimHexPrefix", () => {
  test("should remove the '0x' prefix from a hexadecimal string", () => {
    expect(trimHexPrefix("0xABCDEF")).toBe("ABCDEF");
  });

  test("should not remove the '0x' prefix from a non-hexadecimal string", () => {
    expect(trimHexPrefix("0x12345G")).toBe("0x12345G");
  });

  test("should thtow an error for a non-string value", () => {
    // @ts-expect-error: `trimHexPrefix` expects a string but to test the error we pass a number
    expect(() => trimHexPrefix(123)).toThrow("Input must be a string");
  });
});
