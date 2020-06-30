import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".fresh", function () {
    it("should return true when the resource is not modified", function (done) {
      const app = opine();
      const etag = '"12345"';

      app.use(function (req, res) {
        res.set("ETag", etag);
        res.send(req.fresh);
      });

      superdeno(app)
        .get("/")
        .set("If-None-Match", etag)
        .expect(304, done);
    });

    it("should return false when the resource is modified", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("ETag", '"123"');
        res.send(req.fresh);
      });

      superdeno(app)
        .get("/")
        .set("If-None-Match", '"12345"')
        .expect(200, "false", done);
    });

    it("should return false without response headers", function (done) {
      const app = opine();

      app.disable("x-powered-by");
      app.use(function (req, res) {
        res.send(req.fresh);
      });

      superdeno(app)
        .get("/")
        .expect(200, "false", done);
    });
  });
});
