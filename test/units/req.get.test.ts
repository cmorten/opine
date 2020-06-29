import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".get(field)", function () {
    it("should return the header field value", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.get("Something-Else")).toBeUndefined();
        res.end(req.get("Content-Type") as string);
      });

      superdeno(app)
        .post("/")
        .set("Content-Type", "application/json")
        .expect("application/json", done);
    });

    it("should special-case Referer", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.get("Referer") as string);
      });

      superdeno(app)
        .post("/")
        .set("Referrer", "http://foobar.com")
        .expect("http://foobar.com", done);
    });

    it("should special-case Referrer", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.get("Referrer") as string);
      });

      superdeno(app)
        .post("/")
        .set("Referer", "http://foobar.com")
        .expect("http://foobar.com", done);
    });
  });
});
