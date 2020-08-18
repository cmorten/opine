import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect, superdeno } from "../deps.ts";
import { join, dirname } from "../../deps.ts";
import { Request, Response, NextFunction } from "../../src/types.ts";

const __dirname = dirname(import.meta.url);
const fixtures = join(__dirname, "../fixtures");

console.log({ __dirname, fixtures });

function createApp(path: string) {
  console.log("createApp", { path });
  const app = opine();

  app.use(async function (req, res, next) {
    try {
      console.log("createApp: sending file");
      await res.sendFile(path);
      console.log("createApp: file sent");
    } catch (err) {
      console.log("createApp: there was an error", { err });
      next(err);
    }
  });

  return app;
}

describe("res", function () {
  describe(".sendFile(path)", function () {
    it("should transfer a file", function (done) {
      const app = createApp(join(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect(200, "deno", done);
    });

    it("should transfer a file with special characters in string", function (
      done,
    ) {
      const app = createApp(join(fixtures, "% of dogs.txt"));

      superdeno(app)
        .get("/")
        .expect(200, "20%", done);
    });

    it("should include ETag", function (done) {
      const app = createApp(join(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect("ETag", /^(?:W\/)?"[^"]+"$/)
        .expect(200, "deno", done);
    });

    it("should 304 when ETag matches", function (done) {
      const app = createApp(join(fixtures, "name.txt"));

      superdeno(app)
        .get("/")
        .expect("ETag", /^(?:W\/)?"[^"]+"$/)
        .expect(200, "deno", function (err, res) {
          if (err) {
            return done(err);
          }

          const etag = res.header.etag;

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

    it("should error when not found", function (done) {
      const app = createApp(join(fixtures, "does-no-exist"));

      app.use(function (req, res) {
        res.status = 200;
        res.send("no!");
      });

      app.use(
        function (err: any, req: Request, res: Response, next: NextFunction) {
          expect(err).toBeInstanceOf(Deno.errors.NotFound);
          res.sendStatus(404);
        },
      );

      superdeno(app)
        .get("/")
        .expect(404, done);
    });

    it("should not override manual content-types", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.type("application/x-bogus");
        res.sendFile(join(fixtures, "name.txt"));
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/x-bogus")
        .end(done);
    });
  });
});
