import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".clearCookie(name)", function () {
    it("should set a cookie passed expiry", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.clearCookie("sid").end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Set-Cookie",
          "sid=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        )
        .expect(200, done);
    });
  });

  describe(".clearCookie(cookie)", function () {
    it("should set a cookie passed expiry", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.clearCookie({ name: "sid", value: "" }).end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Set-Cookie",
          "sid=; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        )
        .expect(200, done);
    });
  });
});
