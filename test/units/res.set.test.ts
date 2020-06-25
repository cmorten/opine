import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";
import { expect } from "../deps.ts";

describe("res", function () {
  describe(".set(field, value)", function () {
    it("should set the response header field", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/x-foo; charset=utf-8").end();
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/x-foo; charset=utf-8")
        .end(done);
    });

    it("should coerce to a string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("X-Number", 123 as any);
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("X-Number", "123")
        .expect(200, "string", done);
    });
  });

  describe(".set(field, values)", function () {
    it("should set multiple response header fields", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Set-Cookie", ["type=ninja", "language=javascript"]);
        res.set(
          "Accept",
          ["text/html", "application/xhtml+xml", "application/xml;q=0.9"],
        );
        res.send(res.get("Set-Cookie"));
      });

      superdeno(app)
        .get("/")
        .expect(
          "Accept",
          "text/html, application/xhtml+xml, application/xml;q=0.9",
        )
        .expect(200, "type=ninja, language=javascript", done);
    });

    it("should coerce to an array of strings", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("X-Numbers", [123 as any, 456 as any]).end();
      });

      superdeno(app)
        .get("/")
        .expect("X-Numbers", "123, 456")
        .expect(200, done);
    });

    it("should not set a charset of one is already set", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/html; charset=lol");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/html; charset=lol")
        .expect(200, done);
    });

    it("should throw when Content-Type is an array", function (done) {
      const app = opine();
      const mimeType = "application/wasm";

      app.use(function (req, res) {
        res.set("Content-Type", [mimeType]);
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(
          500,
          /TypeError: Content-Type cannot be set to an Array/,
          (err, res) => {
            expect(res.header["content-type"]).not.toMatch(/application\/wasm/);

            done();
          },
        );
    });
  });

  describe(".set(object)", function () {
    it("should set multiple fields", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set({
          "X-Foo": "bar",
          "X-Bar": "baz",
          "Access-Control-Allow-Methods": ["POST", "GET", "OPTIONS"],
        }).end();
      });

      superdeno(app)
        .get("/")
        .expect("X-Foo", "bar")
        .expect("X-Bar", "baz")
        .expect("access-control-allow-methods", "POST, GET, OPTIONS")
        .end(done);
    });

    it("should coerce to a string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set({ "X-Number": 123 as any });
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("X-Number", "123")
        .expect(200, "string", done);
    });
  });
});
