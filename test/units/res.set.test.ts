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

    it("should coerce value to string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("X-Number", 123 as any);
        res.set(
          "Access-Control-Allow-Methods",
          ["POST", "GET", "OPTIONS"] as any,
        );
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        .expect("X-Number", "123")
        .expect(200, "string", done);
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
  });

  describe(".set(object)", function () {
    it("should set multiple fields", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set({
          "X-Foo": "bar",
          "X-Bar": "baz",
        }).end();
      });

      superdeno(app)
        .get("/")
        .expect("X-Foo", "bar")
        .expect("X-Bar", "baz")
        .end(done);
    });

    it("should coerce value to a string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set(
          {
            "X-Number": 123 as any,
            "Access-Control-Allow-Methods": ["POST", "GET", "OPTIONS"] as any,
          },
        );
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("X-Number", "123")
        .expect("access-control-allow-methods", "POST,GET,OPTIONS")
        .expect(200, "string", done);
    });
  });
});
