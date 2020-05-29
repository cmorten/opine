import { text } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockText = "Hello Deno!";

const jsonHeaders = new Headers();
jsonHeaders.set("Content-Type", "application/json");
jsonHeaders.set("Content-Length", "1");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");

//TODO: refactor this once have a supertest equivalent allowing for
// easy port of Express tests.
describe("bodyParser: text", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = { headers: textHeaders };
    req.headers.set("Content-Length", "0");
    const parser = text();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.parsedBody).toEqual("");
      done();
    });
  });

  it("should handle requests with encoded text bodies", (done) => {
    const req: any = {
      body: new Deno.Buffer(encoder.encode(mockText)),
      headers: textHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = text();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.parsedBody).toEqual(mockText);
      done();
    });
  });

  it("should not alter request bodies when the content type is not text", (
    done,
  ) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: jsonHeaders,
    };
    const parser = text();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      expect(req.parsedBody).toBeUndefined();
      done();
    });
  });
});
