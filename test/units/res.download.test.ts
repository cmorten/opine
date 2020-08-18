import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

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

  describe("on failure", function () {
    it("should invoke the callback", function (done) {
      const app = opine();

      app.use(async function (req, res, next) {
        try {
          await res.download("test/fixtures/foobar.html");
        } catch (err) {
          if (!err) {
            return next(new Error("expected error"));
          }

          res.send(err.message);
        }
      });

      superdeno(app).get("/").expect(200, /(No such file or directory|The system cannot find the file specified)/, done);
    });

    it("should remove Content-Disposition", function (done) {
      const app = opine();

      app.use(async function (req, res, next) {
        try {
          await res.download("test/fixtures/foobar.html");
        } catch (err) {
          if (!err) {
            return next(new Error("expected error"));
          }
          res.end("failed");
        }
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
