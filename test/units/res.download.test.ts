import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it, shouldHaveBody } from "../utils.ts";

describe("res", function () {
  describe(".download(path)", function () {
    it("should transfer as an attachment", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.download("test/fixtures/user.html");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect("Content-Disposition", 'attachment; filename="user.html"')
        .expect(200, "<p>{{user.name}}</p>", done);
    });
  });

  describe(".download(path, filename)", function () {
    it("should provide an alternate filename", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.download("test/fixtures/user.html", "document");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect("Content-Disposition", 'attachment; filename="document"')
        .expect(200, done);
    });
  });

  describe(".download(path, filename, options)", function () {
    it("should accept options", function (done) {
      const app = opine();
      var options = {};

      app.use(function (req, res) {
        res.download("test/fixtures/user.html", "document", options);
      });

      superdeno(app)
        .get("/")
        .expect(200)
        .expect("Content-Type", "text/html; charset=utf-8")
        .expect("Content-Disposition", 'attachment; filename="document"')
        .end(done);
    });

    it("should allow options to res.sendFile()", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.download("test/fixtures/.name", "document", {
          dotfiles: "allow",
          maxAge: "4h",
        });
      });

      superdeno(app)
        .get("/")
        .expect(200)
        .expect("Content-Disposition", 'attachment; filename="document"')
        .expect("Cache-Control", "public, max-age=14400")
        .expect(shouldHaveBody(("Deno")))
        .end(done);
    });

    describe("when options.headers contains Content-Disposition", function () {
      it("should be ignored", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.download("test/fixtures/user.html", "document", {
            headers: {
              "Content-Type": "text/x-custom",
              "Content-Disposition": "inline",
            },
          });
        });

        superdeno(app)
          .get("/")
          .expect(200)
          .expect("Content-Type", "text/x-custom; charset=utf-8")
          .expect("Content-Disposition", 'attachment; filename="document"')
          .end(done);
      });

      it("should be ignored case-insensitively", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.download("test/fixtures/user.html", "document", {
            headers: {
              "content-type": "text/x-custom",
              "content-disposition": "inline",
            },
          });
        });

        superdeno(app)
          .get("/")
          .expect(200)
          .expect("Content-Type", "text/x-custom; charset=utf-8")
          .expect("Content-Disposition", 'attachment; filename="document"')
          .end(done);
      });
    });
  });

  describe("on failure", function () {
    it("should throw an error", function (done) {
      const app = opine();

      app.use(async function (req, res, next) {
        try {
          await res.download("test/fixtures/foobar.html");
        } catch (err) {
          return res.send("got " + err.status + " " + err.code);
        }

        next(new Error("expected error"));
      });

      superdeno(app)
        .get("/")
        .expect(200, "got 404 ENOENT", done);
    });

    it("should remove Content-Disposition", function (done) {
      const app = opine();

      app.use(async function (req, res, next) {
        try {
          await res.download("test/fixtures/foobar.html");
        } catch (_) {
          return res.end("failed");
        }

        next(new Error("expected error"));
      });

      superdeno(app)
        .get("/")
        .expect(function (res: any) {
          expect(res.header["content-disposition"]).toBeUndefined();
        })
        .expect(200, "failed", done);
    });
  });
});
