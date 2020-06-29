import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".json(object)", function () {
    it("should not support jsonp callbacks", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json({ foo: "bar" });
      });

      superdeno(app)
        .get("/?callback=foo")
        .expect('{"foo":"bar"}', done);
    });

    it("should not override previous Content-Types", function (done) {
      const app = opine();

      app.get("/", function (req, res) {
        res.type("application/vnd.example+json");
        res.json({ hello: "world" });
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/vnd.example+json")
        .expect(200, '{"hello":"world"}', done);
    });

    describe("when given primitives", function () {
      it("should respond with json for null", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json(null);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, "null", done);
      });

      it("should respond with json for Number", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json(300);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, "300", done);
      });

      it("should respond with json for String", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json("str");
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '"str"', done);
      });
    });

    describe("when given an array", function () {
      it("should respond with json", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json(["foo", "bar", "baz"]);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '["foo","bar","baz"]', done);
      });
    });

    describe("when given an object", function () {
      it("should respond with json", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json({ name: "deno" });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{"name":"deno"}', done);
      });
    });

    describe('"json escape" setting', function () {
      it("should be undefined by default", function () {
        const app = opine();
        expect(app.get("json escape")).toEqual(undefined);
      });

      it("should unicode escape HTML-sniffing characters", function (done) {
        const app = opine();

        app.enable("json escape");

        app.use(function (req, res) {
          res.json({ "&": "<script>" });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{"\\u0026":"\\u003cscript\\u003e"}', done);
      });
    });

    describe('"json replacer" setting', function () {
      it("should be passed to JSON.stringify()", function (done) {
        const app = opine();

        app.set("json replacer", function (key: string, val: string) {
          return key[0] === "_" ? undefined : val;
        });

        app.use(function (req, res) {
          res.json({ name: "deno", _id: 12345 });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{"name":"deno"}', done);
      });
    });

    describe('"json spaces" setting', function () {
      it("should be undefined by default", function () {
        const app = opine();
        expect(app.get("json spaces")).toEqual(undefined);
      });

      it("should be passed to JSON.stringify()", function (done) {
        const app = opine();

        app.set("json spaces", 2);

        app.use(function (req, res) {
          res.json({ name: "deno", age: 2 });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{\n  "name": "deno",\n  "age": 2\n}', done);
      });
    });
  });
});
