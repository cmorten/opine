import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("app.route", function () {
  it("should return a new route", function (done) {
    const app = opine();

    app.route("/foo")
      .get(function (req, res) {
        res.send("get");
      })
      .post(function (req, res) {
        res.send("post");
      });

    superdeno(app)
      .post("/foo")
      .expect("post", done);
  });

  it("should all .VERB after .all", function (done) {
    const app = opine();

    app.route("/foo")
      .all(function (req, res, next) {
        next();
      })
      .get(function (req, res) {
        res.send("get");
      })
      .post(function (req, res) {
        res.send("post");
      });

    superdeno(app)
      .post("/foo")
      .expect("post", done);
  });

  it("should support dynamic routes", function (done) {
    const app = opine();

    app.route("/:foo")
      .get(function (req, res) {
        res.send(req.params.foo);
      });

    superdeno(app)
      .get("/test")
      .expect("test", done);
  });

  it("should not error on empty routes", function (done) {
    const app = opine();

    app.route("/:foo");

    superdeno(app)
      .get("/test")
      .expect(404, done);
  });
});
