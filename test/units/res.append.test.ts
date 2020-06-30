import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".append(field, val)", function () {
    it("should append multiple headers", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.append("Link", "<http://localhost/>");
        next();
      });

      app.use(function (req, res) {
        res.append("Link", "<http://localhost:80/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://localhost/>, <http://localhost:80/>", done);
    });

    it("should get reset by res.set(field, val)", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.append("Link", "<http://localhost/>");
        res.append("Link", "<http://localhost:80/>");
        next();
      });

      app.use(function (req, res) {
        res.set("Link", "<http://127.0.0.1/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://127.0.0.1/>", done);
    });

    it("should work with res.set(field, val) first", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.set("Link", "<http://localhost/>");
        next();
      });

      app.use(function (req, res) {
        res.append("Link", "<http://localhost:80/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://localhost/>, <http://localhost:80/>", done);
    });

    it("should work with cookies", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.cookie({ name: "foo", value: "bar" });
        next();
      });

      app.use(function (req, res) {
        res.append("Set-Cookie", "bar=baz");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(function (res: any) {
          expect(res.headers["set-cookie"]).toEqual(
            "foo=bar; Path=/, bar=baz",
          );
        })
        .expect(200, done);
    });
  });
});
