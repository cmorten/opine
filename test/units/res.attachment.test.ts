import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".attachment()", function () {
    it("should Content-Disposition to attachment", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.attachment().send("foo");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Disposition", "attachment", done);
    });
  });

  describe(".attachment(filename)", function () {
    it("should add the filename param", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.attachment("/path/to/image.png");
        res.send("foo");
      });

      superdeno(app)
        .get("/")
        .expect(
          "Content-Disposition",
          'attachment; filename="image.png"',
          done,
        );
    });

    it("should set the Content-Type", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.attachment("/path/to/image.png");
        res.send(new Uint8Array());
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "image/png", done);
    });
  });

  describe(".attachment(utf8filename)", function () {
    it("should add the filename and filename* params", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.attachment("/locales/日本語.txt");
        res.send("japanese");
      });

      superdeno(app)
        .get("/")
        .expect(
          "Content-Disposition",
          "attachment; filename=\"???.txt\"; filename*=UTF-8''%E6%97%A5%E6%9C%AC%E8%AA%9E.txt",
        )
        .expect(200, done);
    });

    it("should set the Content-Type", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.attachment("/locales/日本語.txt");
        res.send("japanese");
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/plain; charset=utf-8", done);
    });
  });
});
