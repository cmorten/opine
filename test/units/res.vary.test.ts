import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";

describe("res.vary()", function () {
  describe("with a string", function () {
    it("should set the value", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.vary("Accept");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Vary", "Accept")
        .expect(200, done);
    });
  });

  describe("when the value is present", function () {
    it("should not add it again", function (done) {
      const app = opine();

      app.use(function (_req, res) {
        res.vary("Accept");
        res.vary("Accept-Encoding");
        res.vary("Accept-Encoding");
        res.vary("Accept-Encoding");
        res.vary("Accept");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Vary", "Accept, Accept-Encoding")
        .expect(200, done);
    });
  });
});
