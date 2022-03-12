import { raw } from "../../mod.ts";
import { Buffer, expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockText = "Hello Deno!";

const octetHeaders = new Headers();
octetHeaders.set("Content-Type", "application/octet-stream");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");
textHeaders.set("Content-Length", "1");

describe("bodyParser: raw", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = { headers: octetHeaders };
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.parsedBody).toEqual("");
      done();
    });
  });

  it("should handle requests with encoded raw bodies", (done) => {
    const encodedText = encoder.encode(mockText);
    const req: any = {
      body: new Buffer(encodedText),
      headers: octetHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.parsedBody).toEqual(encodedText);
      done();
    });
  });

  it("should not alter request bodies when the content type is not raw", (done) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: textHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      expect(req.parsedBody).toBeUndefined();
      done();
    });
  });
});
