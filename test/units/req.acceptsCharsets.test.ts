import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".acceptsCharsets(type)", function () {
    describe("when Accept-Charset is not present", function () {
      it("should return true", function (done) {
        const app = opine();

        app.use(function (req, res, next) {
          res.end(req.acceptsCharsets("utf-8") ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .expect("yes", done);
      });
    });

    describe("when Accept-Charset is present", function () {
      it("should return true", function (done) {
        const app = opine();

        app.use(function (req, res, next) {
          res.end(req.acceptsCharsets("utf-8") ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("Accept-Charset", "foo, bar, utf-8")
          .expect("yes", done);
      });

      it("should return false otherwise", function (done) {
        const app = opine();

        app.use(function (req, res, next) {
          res.end(req.acceptsCharsets("utf-8") ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("Accept-Charset", "foo, bar")
          .expect("no", done);
      });
    });
  });
});
