import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";

describe("res", function () {
  describe(".set(field, value)", function () {
    it("should set the response header field", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/x-foo; charset=utf-8").end();
      });

      superdeno(app as any)
        .get("/")
        .expect("Content-Type", "text/x-foo; charset=utf-8")
        .end(done);
    });

    it("should coerce to a string", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("X-Number", 123 as any);
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app as any)
        .get("/")
        .expect("X-Number", "123")
        .expect(200, "string", done);
    });
  });

  describe(".set(field, values)", function () {
    it("should set multiple response header fields", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("Set-Cookie", ["type=ninja", "language=javascript"]);
        res.send(res.get("Set-Cookie"));
      });

      superdeno(app as any)
        .get("/")
        .expect(200, "type=ninja, language=javascript", done);
    });

    it("should coerce to an array of strings", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("X-Numbers", [123 as any, 456 as any]).end();
      });

      superdeno(app as any)
        .get("/")
        .expect("X-Numbers", "123, 456")
        .expect(200, done);
    });

    it("should not set a charset of one is already set", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/html; charset=lol");
        res.end();
      });

      superdeno(app as any)
        .get("/")
        .expect("Content-Type", "text/html; charset=lol")
        .expect(200, done);
    });

    it("should throw when Content-Type is an array", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", ["text/html"]);
        res.end();
      });

      superdeno(app as any)
        .get("/")
        .expect(500, /TypeError: Content-Type cannot be set to an Array/, done);
    });
  });

  describe(".set(object)", function () {
    it("should set multiple fields", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set({
          "X-Foo": "bar",
          "X-Bar": "baz",
        }).end();
      });

      superdeno(app as any)
        .get("/")
        .expect("X-Foo", "bar")
        .expect("X-Bar", "baz")
        .end(done);
    });

    it("should coerce to a string", function (done) {
      var app = opine();

      app.use(function (req, res) {
        res.set({ "X-Number": 123 as any });
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app as any)
        .get("/")
        .expect("X-Number", "123")
        .expect(200, "string", done);
    });
  });
});
