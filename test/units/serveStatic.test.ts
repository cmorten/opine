import type { Opine, OpineResponse } from "../../mod.ts";
import { opine, serveStatic } from "../../mod.ts";
import {
  describe,
  it,
  shouldHaveBody,
  shouldNotHaveBody,
  shouldNotHaveHeader,
} from "../utils.ts";
import { expect, superdeno } from "../deps.ts";
import { dirname, join } from "../../deps.ts";

const __dirname = dirname(import.meta.url);
const fixtures = join(__dirname, "../fixtures");

function createApp(dir: string = fixtures, opts?: unknown) {
  const app = opine();

  app.use(serveStatic(dir, opts));

  return app;
}

describe("serveStatic()", function () {
  describe("basic operations", function () {
    let server: Opine;

    it("should serve static files", function (done) {
      server = createApp();

      superdeno(server)
        .get("/todo.txt")
        .expect(200, "- groceries", done);
    });

    it("should support nesting", function (done) {
      server = createApp();

      superdeno(server)
        .get("/users/deno.txt")
        .expect(200, "dino", done);
    });

    it("should set Content-Type", function (done) {
      server = createApp();

      superdeno(server)
        .get("/todo.txt")
        .expect("Content-Type", "text/plain; charset=utf-8")
        .expect(200, done);
    });

    it("should set Last-Modified", function (done) {
      server = createApp();

      superdeno(server)
        .get("/todo.txt")
        .expect("Last-Modified", /\d{2} \w{3} \d{4}/)
        .expect(200, done);
    });

    it("should support urlencoded pathnames", function (done) {
      server = createApp();

      superdeno(server)
        .get("/foo%20bar")
        .expect(200)
        .expect(shouldHaveBody("baz"))
        .end(done);
    });

    it("should not choke on auth-looking URL", async function () {
      server = createApp();

      await superdeno(server)
        .get("//todo@txt")
        .expect(404);
    });

    it("should support ../", function (done) {
      server = createApp();

      superdeno(server)
        .get("/users/../todo.txt")
        .expect(200, "- groceries", done);
    });

    it("should support HEAD", function (done) {
      server = createApp();

      superdeno(server)
        .head("/todo.txt")
        .expect(200)
        .expect(shouldNotHaveBody())
        .end(done);
    });

    it("should skip POST requests", async function () {
      server = createApp();

      await superdeno(server)
        .post("/todo.txt")
        .expect(404, /Cannot POST \/todo.txt/);
    });

    it("should support conditional requests", function (done) {
      server = createApp();

      superdeno(server)
        .get("/todo.txt")
        .end(function (err, res) {
          if (err) throw err;
          superdeno(server)
            .get("/todo.txt")
            .set("If-None-Match", res.header.etag as string)
            .expect(304, done);
        });
    });

    it("should serve zero-length files", function (done) {
      server = createApp();

      superdeno(server)
        .get("/empty.txt")
        .expect(200, "", done);
    });
  });

  describe("fallthrough", function () {
    let server: Opine;

    it("should default to true", async function () {
      await superdeno(createApp())
        .get("/does-not-exist")
        .expect(404, /Cannot GET \/does-not-exist/);
    });

    describe("when true", function () {
      it("should fall-through when OPTIONS request", async function () {
        server = createApp(fixtures, { fallthrough: true });

        await superdeno(server)
          .options("/todo.txt")
          .expect(404, /Cannot OPTIONS \/todo.txt/);
      });

      it("should fall-through when URL malformed", async function () {
        server = createApp(fixtures, { fallthrough: true });

        await superdeno(server)
          .get("/%")
          .expect(404, /Cannot GET \/%/);
      });

      describe("with redirect: true", function () {
        it("should fall-through when directory", async function () {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: true },
          );

          await superdeno(server)
            .get("/dinos/")
            .expect(404, /Cannot GET \/dinos\//);
        });

        it("should redirect when directory without slash", function (
          done,
        ) {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: true },
          );

          superdeno(server)
            .get("/dinos")
            .expect(301, done);
        });
      });

      describe("with redirect: false", function () {
        it("should fall-through when directory", async function () {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: false },
          );

          await superdeno(server)
            .get("/dinos/")
            .expect(404, /Cannot GET \/dinos\//);
        });

        it("should fall-through when directory without slash", async function () {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: false },
          );

          await superdeno(server)
            .get("/dinos")
            .expect(404, /Cannot GET \/dinos/);
        });
      });
    });

    describe("when false", function () {
      it("should 405 when OPTIONS request", function (done) {
        server = createApp(fixtures, { fallthrough: false });

        superdeno(server)
          .options("/todo.txt")
          .expect("Allow", "GET, HEAD")
          .expect(405, done);
      });

      it("should 400 when URL malformed", function (done) {
        server = createApp(fixtures, { fallthrough: false });

        superdeno(server)
          .get("/%")
          .expect(400, /BadRequestError/, done);
      });

      describe("with redirect: true", function () {
        it("should 404 when directory", async function () {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: true },
          );

          await superdeno(server)
            .get("/dinos/")
            .expect(404, /NotFound/);
        });

        it("should redirect when directory without slash", function (
          done,
        ) {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: true },
          );

          superdeno(server)
            .get("/dinos")
            .expect(301, done);
        });
      });

      describe("with redirect: false", function () {
        it("should 404 when directory", async function () {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: false },
          );

          await superdeno(server)
            .get("/dinos/")
            .expect(404, /NotFound/);
        });

        it("should 404 when directory without slash", async function () {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: false },
          );

          await superdeno(server)
            .get("/dinos")
            .expect(404, /NotFound/);
        });
      });
    });
  });

  describe("redirect", function () {
    let server: Opine;

    it("should redirect directories", function (done) {
      server = createApp();

      superdeno(server)
        .get("/users")
        .expect(301, done);
    });

    it("should not redirect incorrectly", async function () {
      server = createApp();

      await superdeno(server)
        .get("/")
        .expect(404);
    });

    describe("when false", function () {
      it("should disable redirect", async function () {
        server = createApp(fixtures, { redirect: false });

        await superdeno(server)
          .get("/users")
          .expect(404);
      });
    });
  });

  describe("before", function () {
    it("should reject non-functions", function () {
      expect(() => serveStatic(fixtures, { before: 3 })).toThrow(
        "option before must be function",
      );
    });

    it("should get called when sending file", function (done) {
      const server = createApp(fixtures, {
        before: function (res: OpineResponse) {
          res.set("x-custom", "set");
        },
      });

      superdeno(server)
        .get("/nums.txt")
        .expect("x-custom", "set")
        .expect(200, done);
    });

    it("should not get called on 404", async function () {
      const server = createApp(fixtures, {
        before: function (res: OpineResponse) {
          res.set("x-custom", "set");
        },
      });

      await superdeno(server)
        .get("/bogus/")
        .expect(shouldNotHaveHeader("x-custom"))
        .expect(404);
    });

    it("should not get called on redirect", function (done) {
      const server = createApp(fixtures, {
        before: function (res: OpineResponse) {
          res.set("x-custom", "set");
        },
      });

      superdeno(server)
        .get("/users")
        .expect(shouldNotHaveHeader("x-custom"))
        .expect(301, done);
    });
  });
});
