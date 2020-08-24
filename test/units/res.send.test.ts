import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect, superdeno } from "../deps.ts";
import { methods } from "../../src/methods.ts";
import { Request, Response } from "../../src/types.ts";

const shouldNotHaveHeader = (field: string) =>
  (res: any) => {
    expect(res.header[field.toLowerCase()]).toBeFalsy();
  };

const shouldHaveBody = (buf: any) =>
  (res: any) => {
    const body = res.body || res.text;
    expect(body).toBeTruthy();
    expect(body.toString("hex")).toEqual(buf.toString("hex"));
  };

const shouldNotHaveBody = () =>
  (res: any) => {
    expect(res.text === "" || res.text === undefined || res.text === null)
      .toBeTruthy();
  };

describe("res", function () {
  describe(".send()", function () {
    it('should set body to ""', function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send();
      });

      superdeno(app)
        .get("/")
        .expect(200, "", done);
    });
  });

  describe(".send(null)", function () {
    it('should set body to ""', function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send(null);
      });

      superdeno(app)
        .get("/")
        .expect("Content-Length", "0")
        .expect(200, "", done);
    });
  });

  describe(".send(undefined)", function () {
    it('should set body to ""', function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send(undefined);
      });

      superdeno(app)
        .get("/")
        .expect(200, "", done);
    });
  });

  describe(".send(String)", function () {
    it("should send as html", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send("<p>hey</p>");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect(200, "<p>hey</p>", done);
    });

    it("should set ETag", function (done) {
      const app = opine();

      app.use(function (req, res) {
        const str = Array(1000).join("-");
        res.send(str);
      });

      superdeno(app)
        .get("/")
        .expect("ETag", 'W/"3e7-a8f9e4277095755845250bd405f"')
        .expect(200, done);
    });

    it("should not override Content-Type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/plain").send("hey");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect(200, "hey", done);
    });

    it("should not override charset in Content-Type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/plain; charset=iso-8859-1").send("hey");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/plain; charset=iso-8859-1")
        .expect(200, "hey", done);
    });

    it("should keep charset in Content-Type for Buffers", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/plain; charset=iso-8859-1").send(
          (new TextEncoder()).encode("hi"),
        );
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/plain; charset=iso-8859-1")
        .expect(200, "hi", done);
    });
  });

  describe(".send(Buffer)", function () {
    it("should send as octet-stream", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send((new TextEncoder()).encode("hello"));
      });

      superdeno(app)
        .get("/")
        .expect(200)
        .expect("Content-Type", "application/octet-stream")
        .expect(shouldHaveBody("hello"))
        .end(done);
    });

    it("should set ETag", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send((new TextEncoder()).encode("hello"));
      });

      superdeno(app)
        .get("/")
        .expect("ETag", 'W/"5-aaf4c61ddcc5e8a2dabede0f3b4"')
        .expect(200, done);
    });

    it("should not override Content-Type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/plain").send(
          (new TextEncoder()).encode("hey"),
        );
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect(200, "hey", done);
    });

    it("should not override ETag", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.type("text/plain").set("ETag", '"foo"').send(
          (new TextEncoder()).encode("hey"),
        );
      });

      superdeno(app)
        .get("/")
        .expect("ETag", '"foo"')
        .expect(200, "hey", done);
    });
  });

  describe(".send(Object)", function () {
    it("should send as application/json", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send({ name: "deno" });
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, '{"name":"deno"}', done);
    });
  });

  describe("when the request method is HEAD", function () {
    it("should ignore the body", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send("yay");
      });

      superdeno(app)
        .head("/")
        .expect(200)
        .expect(shouldNotHaveBody())
        .end(done);
    });
  });

  describe("when .statusCode is 204", function () {
    it("should strip Content-* fields, Transfer-Encoding field, and body", function (
      done,
    ) {
      const app = opine();

      app.use(function (req, res) {
        res.setStatus(204).set("Transfer-Encoding", "chunked").send("foo");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Length", "0")
        .expect(shouldNotHaveHeader("Content-Type"))
        .expect(shouldNotHaveHeader("Transfer-Encoding"))
        .expect(204, null, done);
    });
  });

  describe("when .statusCode is 304", function () {
    it("should strip Content-* fields, Transfer-Encoding field, and body", function (
      done,
    ) {
      const app = opine();

      app.use(function (req, res) {
        res.setStatus(304).set("Transfer-Encoding", "chunked").send("foo");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Length", "0")
        .expect(shouldNotHaveHeader("Content-Type"))
        .expect(shouldNotHaveHeader("Transfer-Encoding"))
        .expect(304, null, done);
    });
  });

  it("should always check regardless of length", function (done) {
    const app = opine();
    const etag = '"asdf"';

    app.use(function (req, res, next) {
      res.set("ETag", etag);
      res.send("hey");
    });

    superdeno(app)
      .get("/")
      .set("If-None-Match", etag)
      .expect(304, done);
  });

  it("should respond with 304 Not Modified when fresh", function (done) {
    const app = opine();
    const etag = '"asdf"';

    app.use(function (req, res) {
      const str = Array(1000).join("-");
      res.set("ETag", etag);
      res.send(str);
    });

    superdeno(app)
      .get("/")
      .set("If-None-Match", etag)
      .expect(304, done);
  });

  it("should not perform freshness check unless 2xx or 304", function (done) {
    const app = opine();
    const etag = '"asdf"';

    app.use(function (req, res, next) {
      res.setStatus(500);
      res.set("ETag", etag);
      res.send("hey");
    });

    superdeno(app)
      .get("/")
      .set("If-None-Match", etag)
      .expect("hey")
      .expect(500, done);
  });

  it("should not support jsonp callbacks", function (done) {
    const app = opine();

    app.use(function (req, res) {
      res.send({ foo: "bar" });
    });

    superdeno(app)
      .get("/?callback=foo")
      .expect('{"foo":"bar"}', done);
  });

  it("should be chainable", function (done) {
    const app = opine();

    app.use(function (req, res) {
      expect(res.send("hey")).toEqual(res);
    });

    superdeno(app)
      .get("/")
      .expect(200, "hey", done);
  });

  describe('"etag" setting', function () {
    describe("when enabled", function () {
      it("should send ETag", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send("kajdslfkasdf");
        });

        app.enable("etag");

        superdeno(app)
          .get("/")
          .expect("ETag", 'W/"c-22047f2f9485ec22507dfe30c4a"')
          .expect(200, done);
      });

      methods.forEach(function (method) {
        if (method === "connect") return;

        it(
          "should send ETag in response to " + method.toUpperCase() +
            " request",
          function (done) {
            const app = opine();

            (app as any)[method]("/", function (req: Request, res: Response) {
              res.send("kajdslfkasdf");
            });

            (superdeno(app) as any)[method]("/")
              .expect("ETag", 'W/"c-22047f2f9485ec22507dfe30c4a"')
              .expect(200, done);
          },
        );
      });

      it("should send ETag for empty string response", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send("");
        });

        app.enable("etag");

        superdeno(app)
          .get("/")
          .expect("ETag", 'W/"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"')
          .expect(200, done);
      });

      it("should send ETag for long response", function (done) {
        const app = opine();

        app.use(function (req, res) {
          const str = Array(1000).join("-");
          res.send(str);
        });

        app.enable("etag");

        superdeno(app)
          .get("/")
          .expect("ETag", 'W/"3e7-a8f9e4277095755845250bd405f"')
          .expect(200, done);
      });

      it("should not override ETag when manually set", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.set("etag", '"asdf"');
          res.send(200);
        });

        app.enable("etag");

        superdeno(app)
          .get("/")
          .expect("ETag", '"asdf"')
          .expect(200, done);
      });

      it("should not send ETag for res.send()", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.send();
        });

        app.enable("etag");

        superdeno(app)
          .get("/")
          .expect(shouldNotHaveHeader("ETag"))
          .expect(200, done);
      });
    });

    describe("when disabled", function () {
      it("should send no ETag", function (done) {
        const app = opine();

        app.use(function (req, res) {
          const str = Array(1000).join("-");
          res.send(str);
        });

        app.disable("etag");

        superdeno(app)
          .get("/")
          .expect(shouldNotHaveHeader("ETag"))
          .expect(200, done);
      });

      it("should send ETag when manually set", function (done) {
        const app = opine();

        app.disable("etag");

        app.use(function (req, res) {
          res.set("etag", '"asdf"');
          res.send(200);
        });

        superdeno(app)
          .get("/")
          .expect("ETag", '"asdf"')
          .expect(200, done);
      });
    });

    describe('when "strong"', function () {
      it("should send strong ETag", function (done) {
        const app = opine();

        app.set("etag", "strong");

        app.use(function (req, res) {
          res.send("hello, world!");
        });

        superdeno(app)
          .get("/")
          .expect("ETag", '"d-1f09d30c707d53f3d16c530dd73"')
          .expect(200, done);
      });
    });

    describe('when "weak"', function () {
      it("should send weak ETag", function (done) {
        const app = opine();

        app.set("etag", "weak");

        app.use(function (req, res) {
          res.send("hello, world!");
        });

        superdeno(app)
          .get("/")
          .expect("ETag", 'W/"d-1f09d30c707d53f3d16c530dd73"')
          .expect(200, done);
      });
    });

    describe("when a function", function () {
      it("should send custom ETag", function (done) {
        const app = opine();

        app.set("etag", function (body: any) {
          const chunk = body instanceof Uint8Array
            ? (new TextDecoder()).decode(body)
            : body;

          expect(chunk.toString()).toEqual("hello, world!");

          return '"custom"';
        });

        app.use(function (req, res) {
          res.send("hello, world!");
        });

        superdeno(app)
          .get("/")
          .expect("ETag", '"custom"')
          .expect(200, done);
      });

      it("should not send falsy ETag", function (done) {
        const app = opine();

        app.set("etag", function (body: any) {
          return undefined;
        });

        app.use(function (req, res) {
          res.send("hello, world!");
        });

        superdeno(app)
          .get("/")
          .expect(shouldNotHaveHeader("ETag"))
          .expect(200, done);
      });
    });
  });
});
