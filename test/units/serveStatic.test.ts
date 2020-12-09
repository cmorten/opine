import { opine, serveStatic } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect, superdeno } from "../deps.ts";
import { dirname, join } from "../../deps.ts";

const __dirname = dirname(import.meta.url);
const fixtures = join(__dirname, "../fixtures");

function createApp(dir: string = fixtures, opts?: any) {
  const app = opine();

  app.use(serveStatic(dir, opts));

  return app;
}

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

describe("serveStatic()", function () {
  describe("basic operations", function () {
    let server: any;

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

    it("should not choke on auth-looking URL", function (done) {
      server = createApp();

      superdeno(server)
        .get("//todo@txt")
        .expect(404, done);
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

    it("should skip POST requests", function (done) {
      server = createApp();

      superdeno(server)
        .post("/todo.txt")
        .expect(404, /Cannot POST \/todo.txt/, done);
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
    let server: any;

    it("should default to true", function (done) {
      superdeno(createApp())
        .get("/does-not-exist")
        .expect(404, /Cannot GET \/does-not-exist/, done);
    });

    describe("when true", function () {
      it("should fall-through when OPTIONS request", function (done) {
        server = createApp(fixtures, { fallthrough: true });

        superdeno(server)
          .options("/todo.txt")
          .expect(404, /Cannot OPTIONS \/todo.txt/, done);
      });

      it("should fall-through when URL malformed", function (done) {
        server = createApp(fixtures, { fallthrough: true });

        superdeno(server)
          .get("/%")
          .expect(404, /Cannot GET \/%/, done);
      });

      describe("with redirect: true", function () {
        it("should fall-through when directory", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: true },
          );

          superdeno(server)
            .get("/dinos/")
            .expect(404, /Cannot GET \/dinos\//, done);
        });

        it("should redirect when directory without slash (but can only test end result is 404 as superdeno cannot intercept redirects)", function (
          done,
        ) {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: true },
          );

          superdeno(server)
            .get("/dinos")
            .expect(404, /Cannot GET \/dinos\//, done);
        });
      });

      describe("with redirect: false", function () {
        it("should fall-through when directory", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: false },
          );

          superdeno(server)
            .get("/dinos/")
            .expect(404, /Cannot GET \/dinos\//, done);
        });

        it("should fall-through when directory without slash", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: true, redirect: false },
          );

          superdeno(server)
            .get("/dinos")
            .expect(404, /Cannot GET \/dinos/, done);
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
        it("should 404 when directory", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: true },
          );

          superdeno(server)
            .get("/dinos/")
            .expect(404, /NotFoundError|ENOENT/, done);
        });

        it("should redirect when directory without slash (but can only test end result is 404 as superdeno cannot intercept redirects)", function (
          done,
        ) {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: true },
          );

          superdeno(server)
            .get("/dinos")
            .expect(404, /NotFoundError|ENOENT/, done);
        });
      });

      describe("with redirect: false", function () {
        it("should 404 when directory", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: false },
          );

          superdeno(server)
            .get("/dinos/")
            .expect(404, /NotFoundError|ENOENT/, done);
        });

        it("should 404 when directory without slash", function (done) {
          server = createApp(
            fixtures,
            { fallthrough: false, redirect: false },
          );

          superdeno(server)
            .get("/dinos")
            .expect(404, /NotFoundError|ENOENT/, done);
        });
      });
    });
  });

  describe("redirect", function () {
    let server: any;

    it("should redirect directories", function (done) {
      server = createApp();

      superdeno(server)
        .get("/users")
        .expect(404, /Cannot GET \/users\//, done);
    });

    it("should not redirect incorrectly", function (done) {
      server = createApp();

      superdeno(server)
        .get("/")
        .expect(404, done);
    });

    describe("when false", function () {
      it("should disable redirect", function (done) {
        server = createApp(fixtures, { redirect: false });

        superdeno(server)
          .get("/users")
          .expect(404, done);
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
        before: function (res: any) {
          res.set("x-custom", "set");
        },
      });

      superdeno(server)
        .get("/nums.txt")
        .expect("x-custom", "set")
        .expect(200, done);
    });

    it("should not get called on 404", function (done) {
      const server = createApp(fixtures, {
        before: function (res: any) {
          res.set("x-custom", "set");
        },
      });

      superdeno(server)
        .get("/bogus/")
        .expect(shouldNotHaveHeader("x-custom"))
        .expect(404, done);
    });

    it("should not get called on redirect", function (done) {
      const server = createApp(fixtures, {
        before: function (res: any) {
          res.set("x-custom", "set");
        },
      });

      superdeno(server)
        .get("/users")
        .expect(shouldNotHaveHeader("x-custom"))
        .expect(404, done);
    });
  });
});
