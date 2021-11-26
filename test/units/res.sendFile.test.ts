// deno-lint-ignore-file no-explicit-any
import { opine } from "../../mod.ts";
import {
  after,
  describe,
  it,
  shouldHaveBody,
  shouldNotHaveHeader,
} from "../utils.ts";
import { superdeno } from "../deps.ts";
import {
  dirname,
  fromFileUrl,
  join,
  resolve,
  setImmediate,
} from "../../deps.ts";
import { NextFunction, OpineRequest, OpineResponse } from "../../src/types.ts";

const __dirname = dirname(import.meta.url);
const fixtures = fromFileUrl(new URL("fixtures", __dirname).toString());

function createApp(path: string, options?: any) {
  const app = opine();
  // console.log({ fixtures, path });

  app.use(async function (_req, res, next) {
    try {
      await res.sendFile(path, options);
    } catch (err) {
      next(err);
    }
  });

  return app;
}

describe("res", function () {
  describe(".sendFile(path)", function () {
    it("should transfer a file", function (done) {
      const app = createApp(resolve(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect(200, "deno", done);
    });

    it(
      "should transfer a file with special characters in string (provided the path segment is passed through encodeURIComponent first)",
      function (
        done,
      ) {
        const app = createApp(
          resolve(fixtures, encodeURIComponent("% of dogs.txt")),
        );

        superdeno(app)
          .get("/")
          .expect(200, "20%", done);
      },
    );

    it("should include ETag", function (done) {
      const app = createApp(resolve(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect("ETag", /^(?:W\/)?"[^"]+"$/)
        .expect(200, "deno", done);
    });

    it("should 304 when ETag matches", function (done) {
      const app = createApp(resolve(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect("ETag", /^(?:W\/)?"[^"]+"$/)
        .expect(200, "deno", function (err, res) {
          if (err) {
            return done(err);
          }

          const etag = res.header.etag as string;

          superdeno(app)
            .get("/")
            .set("If-None-Match", etag)
            .expect(304, done);
        });
    });

    it("should 404 for directory", function (done) {
      const app = createApp(join(fixtures, "blog"));

      superdeno(app)
        .get("/")
        .expect(404, done);
    });

    it("should 404 when not found", function (done) {
      const app = createApp(resolve(fixtures, "does-not-exist"));

      app.use(function (_req, res) {
        res.status = 200;
        res.send("no!");
      });

      superdeno(app)
        .get("/")
        .expect(404, done);
    });

    it("should resolve without error when HEAD", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.sendFile(resolve(fixtures, "name.txt"));
      });

      superdeno(app)
        .head("/")
        .expect(200, done);
    });

    it("should resolve without error when 304", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.sendFile(resolve(fixtures, "name.txt"));
      });

      superdeno(app)
        .get("/")
        .expect("ETag", /^(?:W\/)?"[^"]+"$/)
        .expect(200, "deno", function (err, res) {
          if (err) return done(err);
          const etag = res.header.etag as string;

          superdeno(app)
            .get("/")
            .set("If-None-Match", etag)
            .expect(304, done);
        });
    });

    it("should not override manual content-types", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.type("application/x-bogus");
        res.sendFile(resolve(fixtures, "name.txt"));
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/x-bogus")
        .end(done);
    });

    it("should not error if the client aborts", function (done) {
      const app = opine();
      const cb = after(2, done);
      let error: any = null;

      app.use(function (_req, res) {
        setImmediate(function () {
          res.sendFile(resolve(fixtures, "name.txt"));
          server.close();
          cb();
          setTimeout(function () {
            cb(error);
          }, 10);
        });

        test.abort();
      });

      app.use(
        function (
          err: Error,
          _req: OpineRequest,
          _res: OpineResponse,
          next: NextFunction,
        ) {
          error = err;
          next(err);
        },
      );

      const server = app.listen();
      const test = superdeno(server).get("/");
      test.end();
    });

    describe('with "cacheControl" option', function () {
      it("should enable cacheControl by default", function (done) {
        const app = createApp(resolve(fixtures, "name.txt"));

        superdeno(app)
          .get("/")
          .expect("Cache-Control", "public, max-age=0")
          .expect(200, done);
      });

      it("should accept cacheControl option", function (done) {
        const app = createApp(
          resolve(fixtures, "name.txt"),
          { cacheControl: false },
        );

        superdeno(app)
          .get("/")
          .expect(shouldNotHaveHeader("Cache-Control"))
          .expect(200, done);
      });
    });

    describe('with "dotfiles" option', function () {
      it("should not serve dotfiles by default", function (done) {
        const app = createApp(resolve(fixtures, ".name"));

        superdeno(app)
          .get("/")
          .expect(404, done);
      });

      it("should accept dotfiles option", function (done) {
        const app = createApp(
          resolve(fixtures, ".name"),
          { dotfiles: "allow" },
        );

        superdeno(app)
          .get("/")
          .expect(200)
          .expect(shouldHaveBody("Deno"))
          .end(done);
      });
    });

    describe('with "headers" option', function () {
      it("should accept headers option", function (done) {
        const headers = {
          "x-success": "sent",
          "x-other": "done",
        };

        const app = createApp(
          resolve(fixtures, "name.txt"),
          { headers: headers },
        );

        superdeno(app)
          .get("/")
          .expect("x-success", "sent")
          .expect("x-other", "done")
          .expect(200, done);
      });

      it("should ignore headers option on 404", function (done) {
        const headers = { "x-success": "sent" };

        const app = createApp(
          resolve(fixtures, "does-not-exist"),
          { headers: headers },
        );

        superdeno(app)
          .get("/")
          .expect(shouldNotHaveHeader("X-Success"))
          .expect(404, done);
      });
    });

    describe('with "immutable" option', function () {
      it("should add immutable cache-control directive", function (done) {
        const app = createApp(resolve(fixtures, "name.txt"), {
          immutable: true,
          maxAge: "4h",
        });

        superdeno(app)
          .get("/")
          .expect("Cache-Control", "public, max-age=14400, immutable")
          .expect(200, done);
      });
    });

    describe('with "maxAge" option', function () {
      it("should set cache-control max-age from number", function (done) {
        const app = createApp(resolve(fixtures, "name.txt"), {
          maxAge: 14400000,
        });

        superdeno(app)
          .get("/")
          .expect("Cache-Control", "public, max-age=14400")
          .expect(200, done);
      });

      it("should set cache-control max-age from string", function (done) {
        const app = createApp(resolve(fixtures, "name.txt"), {
          maxAge: "4h",
        });

        superdeno(app)
          .get("/")
          .expect("Cache-Control", "public, max-age=14400")
          .expect(200, done);
      });
    });

    describe('with "root" option', function () {
      it("should not transfer relative without root option", function (done) {
        const app = createApp("test/fixtures/name.txt");

        superdeno(app)
          .get("/")
          .expect(500, /must be absolute/, done);
      });

      it('should serve relative to "root"', function (done) {
        const app = createApp("name.txt", { root: fixtures });

        superdeno(app)
          .get("/")
          .expect(200, "deno", done);
      });

      it('should disallow requesting out of "root"', function (done) {
        const app = createApp("foo/../../user.html", { root: fixtures });

        superdeno(app)
          .get("/")
          .expect(403, done);
      });

      it("should consider ../ malicious", function (
        done,
      ) {
        const app = opine();

        app.use(async function (_req, res) {
          try {
            await res.sendFile(`${fixtures}/foo/../user.html`);
          } catch (err) {
            res.send("got " + err.status);
          }
        });

        superdeno(app)
          .get("/")
          .expect(200, "got 403", done);
      });

      it('should allow ../ when "root" is set', function (done) {
        const app = opine();

        app.use(function (_req, res) {
          res.sendFile("foo/../user.html", { root: "test/fixtures" });
        });

        superdeno(app)
          .get("/")
          .expect(200, done);
      });

      it('should disallow requesting out of "root"', function (done) {
        const app = opine();

        app.use(async function (_req, res) {
          try {
            await res.sendFile(
              "foo/../../user.html",
              { root: "test/fixtures" },
            );
          } catch (err) {
            res.send("got " + err.status);
          }
        });

        superdeno(app)
          .get("/")
          .expect(200, "got 403", done);
      });
    });
  });

  describe(".sendFile(path, options)", function () {
    it("should pass options to send module", function (done) {
      superdeno(createApp(resolve(fixtures, "name.txt"), { start: 1, end: 2 }))
        .get("/")
        .expect(200, "en", done);
    });

    it("should support partial requests", function (done) {
      superdeno(
        createApp(
          resolve(fixtures, "dinos/names.txt"),
          { start: 2, end: 12, acceptRanges: true },
        ),
      )
        .get("/")
        .set("Range", "bytes=3-7")
        .expect(206, "super", done);
    });

    it(
      "should ignore multi-part ranges and treat them as regular responses",
      function (
        done,
      ) {
        superdeno(
          createApp(
            resolve(fixtures, "dinos/names.txt"),
            { start: 2, end: 12, acceptRanges: true },
          ),
        )
          .get("/")
          .set("Range", "bytes=3-7, 9-11")
          .expect(200, "no,superden", done);
      },
    );
  });
});
