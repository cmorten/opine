import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect, mock, superdeno } from "../deps.ts";

describe("res", function () {
  describe(".setHeader(field, value)", function () {
    it("should passthrough to .set", function (done) {
      const app = opine();

      const set = mock.fn(() => undefined);
      app.use(function (_req, res) {
        res.set = set;
        res.setHeader("Content-Type", "text/x-foo; charset=utf-8").end();
      });

      superdeno(app)
        .get("/")
        .end(() => {
          expect(set).toHaveBeenCalledWith(
            "Content-Type",
            "text/x-foo; charset=utf-8",
          );
          done();
        });
    });
  });

  describe(".setHeader(object)", function () {
    it("should passthrough to .set", function (done) {
      const app = opine();

      const set = mock.fn(() => undefined);
      app.use(function (_req, res) {
        res.set = set;
        res.setHeader({
          "X-Foo": "bar",
          "X-Bar": "baz",
        }).end();
      });

      superdeno(app)
        .get("/")
        .end(() => {
          expect(set).toHaveBeenCalledWith({
            "X-Foo": "bar",
            "X-Bar": "baz",
          }, undefined);
          done();
        });
    });
  });
});
