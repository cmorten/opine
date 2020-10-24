import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".ips", function () {
    describe("when X-Forwarded-For is present", function () {
      describe('when "trust proxy" is enabled', function () {
        it("should return an array of the specified addresses", function (
          done,
        ) {
          const app = opine();

          app.enable("trust proxy");

          app.use(function (req, res, _next) {
            res.send(req.ips);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-For", "client, p1, p2")
            .expect('["client","p1","p2"]', done);
        });

        it("should stop at first untrusted", function (done) {
          const app = opine();

          app.set("trust proxy", 2);

          app.use(function (req, res, _next) {
            res.send(req.ips);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-For", "client, p1, p2")
            .expect('["p1","p2"]', done);
        });
      });

      describe('when "trust proxy" is disabled', function () {
        it("should return an empty array", function (done) {
          const app = opine();

          app.use(function (req, res, _next) {
            res.send(req.ips);
          });

          superdeno(app)
            .get("/")
            .set("X-Forwarded-For", "client, p1, p2")
            .expect("[]", done);
        });
      });
    });

    describe("when X-Forwarded-For is not present", function () {
      it("should return []", function (done) {
        const app = opine();

        app.use(function (req, res, _next) {
          res.send(req.ips);
        });

        superdeno(app)
          .get("/")
          .expect("[]", done);
      });
    });
  });
});
