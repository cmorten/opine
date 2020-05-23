import { urlencoded } from "../../mod.ts";
import { expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

const encoder = new TextEncoder();
const mockFormData = new URLSearchParams("hello=deno&opine=is+awesome");

const formHeaders = new Headers();
formHeaders.set("Content-Type", "application/x-www-form-urlencoded");

const textHeaders = new Headers();
textHeaders.set("Content-Type", "text/plain");

//TODO: refactor this once have a supertest equivalent allowing for
// easy port of Express tests.
describe("bodyParser: urlencoded", () => {
  it("should handle requests without bodies", (done) => {
    const req: any = {};
    const parser = urlencoded();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual({});
      done();
    });
  });

  it("should handle requests with encoded urlencoded bodies", (done) => {
    const req: any = {
      body: new Deno.Buffer(encoder.encode(mockFormData.toString())),
      headers: formHeaders,
    };
    const parser = urlencoded();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(Object.fromEntries(mockFormData));
      done();
    });
  });

  it("should not alter request bodies when the content type is not urlencoded", (
    done,
  ) => {
    const mockBody = Symbol("test-body");
    const req: any = {
      body: mockBody,
      headers: textHeaders,
    };
    const parser = urlencoded();

    parser(req, {} as any, (err?: any) => {
      if (err) throw err;
      expect(req.body).toEqual(mockBody);
      done();
    });
  });
});
