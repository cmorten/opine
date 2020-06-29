import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".route", function () {
    it("should be the executed Route", function (done) {
      const app = opine();

      app.get("/user/:id/:op?", function (req, res, next) {
        expect(req.route.path).toEqual("/user/:id/:op?");
        next();
      });

      app.get("/user/:id/edit", function (req, res) {
        expect(req.route.path).toEqual("/user/:id/edit");
        res.end();
      });

      superdeno(app)
        .get("/user/12/edit")
        .expect(200, done);
    });
  });
});
