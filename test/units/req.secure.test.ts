import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".secure", function () {
    describe("when X-Forwarded-Proto is missing", function () {
      it("should return false when http", function (done) {
        const app = opine();

        app.get("/", function (req, res) {
          res.send(req.secure ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .expect("no", done);
      });
    });
  });

  describe(".secure", function () {
    describe("when X-Forwarded-Proto is present", function () {
      it("should return false when http", function (done) {
        const app = opine();

        app.get("/", function (req, res) {
          res.send(req.secure ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https")
          .expect("no", done);
      });

      it('should return true when "trust proxy" is enabled', function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.get("/", function (req, res) {
          res.send(req.secure ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https")
          .expect("yes", done);
      });

      it("should return false when initial proxy is http", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.get("/", function (req, res) {
          res.send(req.secure ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "http, https")
          .expect("no", done);
      });

      it("should return true when initial proxy is https", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.get("/", function (req, res) {
          res.send(req.secure ? "yes" : "no");
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https, http")
          .expect("yes", done);
      });

      describe('when "trust proxy" trusting hop count', function () {
        it("should respect X-Forwarded-Proto", function (done) {
          const app = opine();

          app.set("trust proxy", 1);

          app.get("/", function (req, res) {
            res.send(req.secure ? "yes" : "no");
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-Proto", "https")
            .expect("yes", done);
        });
      });
    });
  });
});
