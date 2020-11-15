import { json } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockJson = { hello: "deno" };

const jsonHeaders = new Headers();
jsonHeaders.set("Content-Type", "application/json");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");
textHeaders.set("Content-Length", "1");

//TODO: refactor this once have a supertest equivalent allowing for
// easy port of Express tests.
describe("bodyParser: json", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = { headers: jsonHeaders };
    const parser = json();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual({});
      done();
    });
  });

  it("should handle requests with encoded JSON bodies", (done) => {
    const req: any = {
      body: new Deno.Buffer(encoder.encode(JSON.stringify(mockJson))),
      headers: jsonHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = json();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockJson);
      done();
    });
  });

  it("should handle requests with encoded JSON array bodies", (done) => {
    const req: any = {
      body: new Deno.Buffer(encoder.encode(JSON.stringify([mockJson]))),
      headers: jsonHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = json();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual([mockJson]);
      done();
    });
  });

  it("should handle requests with encoded JSON bodies containing whitespace", (
    done,
  ) => {
    const req: any = {
      body: new Deno.Buffer(
        encoder.encode(` \r\n\t\n${JSON.stringify(mockJson)}\n\t\r\n `),
      ),
      headers: jsonHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = json();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockJson);
      done();
    });
  });

  it("should not alter request bodies when the content type is not JSON", (
    done,
  ) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: textHeaders,
    };
    req.headers.set("Content-Length", "1");
    const parser = json();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      expect(req.parsedBody).toBeUndefined();
      done();
    });
  });
});
