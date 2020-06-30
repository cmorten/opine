import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".acceptsLanguages", function () {
    it("should be true if language accepted", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.acceptsLanguages("en-us")).toBeTruthy();
        expect(req.acceptsLanguages("en")).toBeTruthy();
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("Accept-Language", "en;q=.5, en-us")
        .expect(200, done);
    });

    it("should be false if language not accepted", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.acceptsLanguages("es")).toBeFalsy();
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("Accept-Language", "en;q=.5, en-us")
        .expect(200, done);
    });

    describe("when Accept-Language is not present", function () {
      it("should always return true", function (done) {
        const app = opine();

        app.use(function (req, res) {
          expect(req.acceptsLanguages("en")).toBeTruthy();
          expect(req.acceptsLanguages("es")).toBeTruthy();
          expect(req.acceptsLanguages("jp")).toBeTruthy();
          res.end();
        });

        superdeno(app)
          .get("/")
          .expect(200, done);
      });
    });
  });
});
