import { opine, Router } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".baseUrl", function () {
    it("should be empty for top-level route", function (done) {
      const app = opine();

      app.get("/:a", function (req, res) {
        res.end(req.baseUrl);
      });

      superdeno(app)
        .get("/foo")
        .expect(200, "", done);
    });

    it("should contain lower path", function (done) {
      const app = opine();
      const sub = Router();

      sub.get("/:b", function (req, res) {
        res.end(req.baseUrl);
      });
      app.use("/:a", sub);

      superdeno(app)
        .get("/foo/bar")
        .expect(200, "/foo", done);
    });

    it("should contain full lower path", function (done) {
      const app = opine();
      const sub1 = Router();
      const sub2 = Router();
      const sub3 = Router();

      sub3.get("/:d", function (req, res) {
        res.end(req.baseUrl);
      });
      sub2.use("/:c", sub3);
      sub1.use("/:b", sub2);
      app.use("/:a", sub1);

      superdeno(app)
        .get("/foo/bar/baz/zed")
        .expect(200, "/foo/bar/baz", done);
    });

    it("should travel through routers correctly", function (done) {
      const urls: any[] = [];
      const app = opine();
      const sub1 = Router();
      const sub2 = Router();
      const sub3 = Router();

      sub3.get("/:d", function (req, _res, next) {
        urls.push("0@" + req.baseUrl);
        next();
      });
      sub2.use("/:c", sub3);
      sub1.use("/", function (req, _res, next) {
        urls.push("1@" + req.baseUrl);
        next();
      });
      sub1.use("/bar", sub2);
      sub1.use("/bar", function (req, _res, next) {
        urls.push("2@" + req.baseUrl);
        next();
      });
      app.use(function (req, _res, next) {
        urls.push("3@" + req.baseUrl);
        next();
      });
      app.use("/:a", sub1);
      app.use(function (req, res) {
        urls.push("4@" + req.baseUrl);
        res.end(urls.join(","));
      });

      superdeno(app)
        .get("/foo/bar/baz/zed")
        .expect(200, "3@,1@/foo,0@/foo/bar/baz,2@/foo/bar,4@", done);
    });
  });
});
