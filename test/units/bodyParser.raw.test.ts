import { raw } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockText = "Hello Deno!";

const octetHeaders = new Headers();
octetHeaders.set("Content-Type", "application/octet-stream");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");

//TODO: refactor this once have a supertest equivalent allowing for
// easy port of Express tests.
describe("bodyParser: raw", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = {};
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual("");
      done();
    });
  });

  it("should handle requests with encoded raw bodies", (done) => {
    const req: any = {
      body: new Deno.Buffer(encoder.encode(mockText)),
      headers: octetHeaders,
    };
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockText);
      done();
    });
  });

  it("should not alter request bodies when the content type is not raw", (
    done,
  ) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: textHeaders,
    };
    const parser = raw();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      done();
    });
  });
});
