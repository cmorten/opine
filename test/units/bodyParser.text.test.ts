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

  describe('with inflate option', function () {
    describe('when false', function () {
      it('should not accept content-encoding', (done) => {
        // Default inflate value is false
        const req: any = {
          body: new Deno.Buffer(encoder.encode("H4sIAAAAAAAA//NIzcnJV3BJzctXBACoAE06CwAAAA==")),
          headers: textHeaders,
        };
        req.headers.set('Content-Encoding', 'gzip')
        const parser = text();

        parser(req, {} as any, (err?: any) => {
          if (err) throw err;
          expect(req.parsedBody).toEqual("H4sIAAAAAAAA//NIzcnJV3BJzctXBACoAE06CwAAAA==");
          done();
        });
      })
    })

    describe('when true', function () {
      it('should accept content-encoding',(done) => {
        const req: any = {
          body: new Deno.Buffer(encoder.encode(mockText)),
          headers: textHeaders,
          options: {
            inflate: true
          }
        };
        req.headers.set('Content-Encoding', 'gzip')
        const parser = text();

        parser(req, {} as any, (err?: any) => {
          if (err) throw err;
          expect(req.parsedBody).toEqual(mockText);
          done();
        });
      })
    })
  })

  describe('encoding', function () {
    it('should parse without encoding', function (done) {
    })

    it('should support identity encoding', function (done) {
    })

    it('should support gzip encoding', function (done) {
    })

    it('should support deflate encoding', function (done) {
    })

    it('should be case-insensitive', function (done) {
    })

    it('should 415 on unknown encoding', function (done) {
    })
  })
});
