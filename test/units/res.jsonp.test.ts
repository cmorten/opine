import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".jsonp(object)", function () {
    it("should respond with jsonp", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?callback=something")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /something\(\{"count":1\}\);/, done);
    });

    it("should use first callback parameter with jsonp", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?callback=something&callback=somethingelse")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /something\(\{"count":1\}\);/, done);
    });

    it("should ignore object callback parameter with jsonp", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?callback[a]=something")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, '{"count":1}', done);
    });

    it("should allow renaming callback", function (done) {
      const app = opine();

      app.set("jsonp callback name", "clb");

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?clb=something")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /something\(\{"count":1\}\);/, done);
    });

    it("should allow []", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?callback=callbacks[123]")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /callbacks\[123\]\(\{"count":1\}\);/, done);
    });

    it("should disallow arbitrary js", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({});
      });

      superdeno(app)
        .get("/?callback=foo;bar()")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /foobar\(\{\}\);/, done);
    });

    it("should escape utf whitespace", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ str: "\u2028 \u2029 woot" });
      });

      superdeno(app)
        .get("/?callback=foo")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect(200, /foo\(\{"str":"\\u2028 \\u2029 woot"\}\);/, done);
    });

    it("should not escape utf whitespace for json fallback", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ str: "\u2028 \u2029 woot" });
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(200, '{"str":"\u2028 \u2029 woot"}', done);
    });

    it("should include security header and prologue", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.jsonp({ count: 1 });
      });

      superdeno(app)
        .get("/?callback=something")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect("X-Content-Type-Options", "nosniff")
        .expect(200, /^\/\*\*\//, done);
    });

    it("should not override previous Content-Types with no callback", function (
      done,
    ) {
      const app = opine();

      app.get("/", function (_req, res) {
        res.type("application/vnd.example+json");
        res.jsonp({ hello: "world" });
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/vnd.example+json")
        .expect(function (res) {
          expect(res.header["X-Content-Type-Options"]).toBeUndefined();
        })
        .expect(200, '{"hello":"world"}', done);
    });

    it("should override previous Content-Types with callback", function (done) {
      const app = opine();

      app.get("/", function (_req, res) {
        res.type("application/vnd.example+json");
        res.jsonp({ hello: "world" });
      });

      superdeno(app)
        .get("/?callback=cb")
        .expect("Content-Type", "text/javascript; charset=utf-8")
        .expect("X-Content-Type-Options", "nosniff")
        .expect(200, /cb\(\{"hello":"world"\}\);$/, done);
    });

    describe("when given primitives", function () {
      it("should respond with json", function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.jsonp(null);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, "null", done);
      });
    });

    describe("when given an array", function () {
      it("should respond with json", function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.jsonp(["foo", "bar", "baz"]);
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

        app.use(function (_req, res) {
          res.jsonp({ name: "deno" });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{"name":"deno"}', done);
      });
    });

    describe("when given primitives", function () {
      it("should respond with json for null", function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.jsonp(null);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, "null", done);
      });

      it("should respond with json for Number", function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.jsonp(300);
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, "300", done);
      });

      it("should respond with json for String", function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.jsonp("str");
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '"str"', done);
      });
    });

    describe('"json escape" setting', function () {
      it("should be undefined by default", function () {
        const app = opine();
        expect(app.get("json escape")).toBeUndefined();
      });

      it("should unicode escape HTML-sniffing characters", function (done) {
        const app = opine();

        app.enable("json escape");

        app.use(function (_req, res) {
          res.jsonp({ "&": "\u2028<script>\u2029" });
        });

        superdeno(app)
          .get("/?callback=foo")
          .expect("Content-Type", "text/javascript; charset=utf-8")
          .expect(
            200,
            /foo\({"\\u0026":"\\u2028\\u003cscript\\u003e\\u2029"}\)/,
            done,
          );
      });
    });

    describe('"json replacer" setting', function () {
      it("should be passed to JSON.stringify()", function (done) {
        const app = opine();

        app.set("json replacer", function (key: string, val: string) {
          return key[0] === "_" ? undefined : val;
        });

        app.use(function (_req, res) {
          res.jsonp({ name: "deno", _id: 12345 });
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
        expect(app.get("json spaces")).toBeUndefined();
      });

      it("should be passed to JSON.stringify()", function (done) {
        const app = opine();

        app.set("json spaces", 2);

        app.use(function (_req, res) {
          res.jsonp({ name: "deno", age: 2 });
        });

        superdeno(app)
          .get("/")
          .expect("Content-Type", "application/json; charset=utf-8")
          .expect(200, '{\n  "name": "deno",\n  "age": 2\n}', done);
      });
    });
  });

  it("should not override previous Content-Types", function (done) {
    const app = opine();

    app.get("/", function (_req, res) {
      res.type("application/vnd.example+json");
      res.jsonp({ hello: "world" });
    });

    superdeno(app)
      .get("/")
      .expect("content-type", "application/vnd.example+json")
      .expect(200, '{"hello":"world"}', done);
  });
});
