import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".stale", function () {
    it("should return false when the resource is not modified", function (
      done,
    ) {
      const app = opine();
      const etag = '"12345"';

      app.use(function (req, res) {
        res.set("ETag", etag);
        res.send(req.stale);
      });

      superdeno(app)
        .get("/")
        .set("If-None-Match", etag)
        .expect(304, done);
    });

    it("should return true when the resource is modified", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("ETag", '"123"');
        res.send(req.stale);
      });

      superdeno(app)
        .get("/")
        .set("If-None-Match", '"12345"')
        .expect(200, "true", done);
    });

    it("should return true without response headers", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send(req.stale);
      });

      superdeno(app)
        .get("/")
        .expect(200, "true", done);
    });
  });
});
