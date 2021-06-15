import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";
import { expect } from "../deps.ts";

describe("res", function () {
  describe(".removeHeader(field)", function () {
    it("should remove the response header field", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/x-foo; charset=utf-8");
        res.removeHeader("Content-Type").end();
      });

      superdeno(app)
        .get("/")
        .end((_, res) => {
          expect(res.header).not.toHaveProperty("Content-Type");
          done();
        });
    });

    it("should do nothing if header is not present", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.removeHeader("Content-Type").end();
      });

      superdeno(app)
        .get("/")
        .expect(200, done);
    });
  });
});
