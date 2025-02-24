import { HttpTransport } from "../src.ts";

describe(HttpTransport, () => {
    it.concurrent("should throw error if url is not provided", async () => {
        expect(() => new HttpTransport(undefined!)).toThrow();
    });

    it.concurrent('should throw error if url is ""', async () => {
        expect(() => new HttpTransport("")).toThrow();
    });

    it.concurrent.each(["htt://localhost", "http://", "https://", "localhost", "invalid", "http:/localhost:1600"])(`should throw error if url is %s`, async (url) => {
        expect(() => new HttpTransport(url)).toThrow();
    });

    it.concurrent.each(["http://localhost:1600", "https://localhost:1600", "http://192.168.1.195:1600", "http://10.128.0.6:1600"])(
        `should create instance with valid url %s`,
        async (url) => {
            expect(new HttpTransport(url)).toBeInstanceOf(HttpTransport);
        }
    );
});
