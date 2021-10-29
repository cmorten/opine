import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".protocol", function () {
    it("should return the protocol string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.protocol);
      });

      superdeno(app)
        .get("/")
        .expect("http", done);
    });

    describe('when "trust proxy" is enabled', function () {
      it("should respect X-Forwarded-Proto", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.use(function (req, res) {
          res.end(req.protocol);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https")
          .expect("https", done);
      });

      it(
        "should default to the conn addr if X-Forwarded-Proto not present",
        function (
          done,
        ) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res) {
            req.proto = "https";
            res.end(req.protocol);
          });

          superdeno(app)
            .get("/")
            .expect("https", done);
        },
      );

      it("should ignore X-Forwarded-Proto if conn addr not trusted", function (
        done,
      ) {
        const app = opine();

        app.set("trust proxy", "10.0.0.1");

        app.use(function (req, res) {
          res.end(req.protocol);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https")
          .expect("http", done);
      });

      it("should default to http", function (done) {
        const app = opine();

        app.enable("trust proxy");

        app.use(function (req, res) {
          res.end(req.protocol);
        });

        superdeno(app)
          .get("/")
          .expect("http", done);
      });

      describe("when trusting hop count", function () {
        it("should respect X-Forwarded-Proto", function (done) {
          const app = opine();

          app.set("trust proxy", 1);

          app.use(function (req, res) {
            res.end(req.protocol);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-Proto", "https")
            .expect("https", done);
        });
      });
    });

    describe('when "trust proxy" is disabled', function () {
      it("should ignore X-Forwarded-Proto", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.end(req.protocol);
        });

        superdeno(app)
          .get("/")
          .set("X-Forwarded-Proto", "https")
          .expect("http", done);
      });
    });
  });
});
