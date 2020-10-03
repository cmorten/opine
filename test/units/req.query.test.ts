import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

function createApp(setting?: any) {
  const app = opine();

  if (setting !== undefined) {
    app.set("query parser", setting);
  }

  app.use(function (req, res) {
    res.send(req.query);
  });

  return app;
}

describe("req", function () {
  describe(".query", function () {
    it("should default to {}", function (done) {
      const app = createApp();

      superdeno(app)
        .get("/")
        .expect(200, "{}", done);
    });

    it("should default to parse complex keys", function (done) {
      const app = createApp();

      superdeno(app)
        .get("/?user[name]=deno")
        .expect(200, '{"user":{"name":"deno"}}', done);
    });

    describe('when "query parser" is extended', function () {
      it("should parse complex keys", function (done) {
        const app = createApp("extended");

        superdeno(app)
          .get("/?foo[0][bar]=baz&foo[0][fizz]=buzz&foo[]=done!")
          .expect(200, '{"foo":[{"bar":"baz","fizz":"buzz"},"done!"]}', done);
      });

      it("should parse parameters with dots", function (done) {
        const app = createApp("extended");

        superdeno(app)
          .get("/?user.name=deno")
          .expect(200, '{"user.name":"deno"}', done);
      });
    });

    describe('when "query parser" is simple', function () {
      it("should not parse complex keys", function (done) {
        const app = createApp("simple");

        superdeno(app)
          .get("/?user%5Bname%5D=deno")
          .expect(200, '{"user[name]":"deno"}', done);
      });
    });

    describe('when "query parser" is a function', function () {
      it("should parse using function", function (done) {
        const app = createApp(function (str: string) {
          return { "length": (str || "").length };
        });

        superdeno(app)
          .get("/?user%5Bname%5D=deno")
          .expect(200, '{"length":19}', done);
      });
    });

    describe('when "query parser" disabled', function () {
      it("should not parse query", function (done) {
        const app = createApp(false);

        superdeno(app)
          .get("/?user%5Bname%5D=deno")
          .expect(200, "{}", done);
      });
    });

    describe('when "query parser" enabled', function () {
      it("should not parse complex keys", function (done) {
        const app = createApp(true);

        superdeno(app)
          .get("/?user%5Bname%5D=deno")
          .expect(200, '{"user[name]":"deno"}', done);
      });
    });

    describe('when "query parser fn" is missing', function () {
      it('should act like "extended"', function (done) {
        const app = opine();

        delete app.settings["query parser"];
        delete app.settings["query parser fn"];

        app.use(function (req, res) {
          res.send(req.query);
        });

        superdeno(app)
          .get("/?user[name]=deno&user.name=deno")
          .expect(200, '{"user":{"name":"deno"},"user.name":"deno"}', done);
      });
    });

    describe('when "query parser" an unknown value', function () {
      it("should throw", function () {
        expect(createApp.bind(null, "bogus")).toThrow(
          /unknown value.*query parser/,
        );
      });
    });
  });
});
