import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".cookie(cookie)", function () {
    it("should set a cookie", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.cookie({ name: "name", value: "deno" }).end();
      });

      superdeno(app)
        .get("/")
        .expect("Set-Cookie", "name=deno; Path=/")
        .expect(200, done);
    });

    it("should allow multiple calls", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.cookie({ name: "name", value: "deno" });
        res.cookie({ name: "age", value: "1" });
        res.cookie({ name: "gender", value: "?" });
        res.end();
      });

      superdeno(app)
        .get("/")
        .end(function (err, res) {
          expect(res.header["set-cookie"]).toEqual(
            "name=deno; Path=/, age=1; Path=/, gender=?; Path=/",
          );
          done();
        });
    });
  });

  describe(".cookie(name, string, options)", function () {
    it("should set params", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.cookie(
          { name: "name", value: "deno", httpOnly: true, secure: true },
        );
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Set-Cookie", "name=deno; Secure; HttpOnly; Path=/")
        .expect(200, done);
    });

    describe("maxAge", function () {
      it("should set max-age", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.cookie({ name: "name", value: "deno", maxAge: 1000 });
          res.end();
        });

        superdeno(app)
          .get("/")
          .expect("Set-Cookie", /Max-Age=1/, done);
      });
    });
  });
});
