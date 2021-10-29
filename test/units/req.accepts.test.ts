import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".accepts(type)", function () {
    it("should return true when Accept is not present", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts("json") ? "yes" : "no");
      });

      superdeno(app)
        .get("/")
        .expect("yes", done);
    });

    it("should return true when present", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts("json") ? "yes" : "no");
      });

      superdeno(app)
        .get("/")
        .set("Accept", "application/json")
        .expect("yes", done);
    });

    it("should return false otherwise", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts("json") ? "yes" : "no");
      });

      superdeno(app)
        .get("/")
        .set("Accept", "text/html")
        .expect("no", done);
    });
  });

  it("should accept an argument list of type names", function (done) {
    const app = opine();

    app.use(function (req, res, next) {
      res.end(req.accepts("json", "html") as string);
    });

    superdeno(app)
      .get("/")
      .set("Accept", "application/json")
      .expect("json", done);
  });

  describe(".accepts(types)", function () {
    it("should return the first when Accept is not present", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts(["json", "html"]) as string);
      });

      superdeno(app)
        .get("/")
        .expect("json", done);
    });

    it("should return the first acceptable type", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts(["json", "html"]) as string);
      });

      superdeno(app)
        .get("/")
        .set("Accept", "text/html")
        .expect("html", done);
    });

    it("should return false when no match is made", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(
          req.accepts(["text/html", "application/json"]) ? "yup" : "nope",
        );
      });

      superdeno(app)
        .get("/")
        .set("Accept", "foo/bar, bar/baz")
        .expect("nope", done);
    });

    it("should take quality into account", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.end(req.accepts(["text/html", "application/json"]) as string);
      });

      superdeno(app)
        .get("/")
        .set("Accept", "*/html; q=.5, application/json")
        .expect("application/json", done);
    });

    it(
      "should return the first acceptable type with canonical mime types",
      function (
        done,
      ) {
        const app = opine();

        app.use(function (req, res, next) {
          res.end(req.accepts(["application/json", "text/html"]) as string);
        });

        superdeno(app)
          .get("/")
          .set("Accept", "*/html")
          .expect("text/html", done);
      },
    );
  });
});
