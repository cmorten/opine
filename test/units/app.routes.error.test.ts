import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";
import { Request, Response, NextFunction } from "../../src/types.ts";

describe("app", function () {
  describe(".VERB()", function () {
    it("should not get invoked without error handler on error", function (
      done,
    ) {
      const app = opine();

      app.use(function (req, res, next) {
        next(new Error("boom!"));
      });

      app.get("/bar", function (req, res) {
        res.send("hello, world!");
      });

      superdeno(app)
        .post("/bar")
        .expect(500, /Error: boom!/, done);
    });

    it("should only call an error handling routing callback when an error is propagated", function (
      done,
    ) {
      const app = opine();

      let a = false;
      let b = false;
      let c = false;
      let d = false;

      app.get("/", function (req, res, next) {
        next(new Error("fabricated error"));
      }, function (req, res, next) {
        a = true;
        next();
      }, function (err: any, req: Request, res: Response, next: NextFunction) {
        b = true;
        expect(err.message).toEqual("fabricated error");
        next(err);
      }, function (err: any, req: Request, res: Response, next: NextFunction) {
        c = true;
        expect(err.message).toEqual("fabricated error");
        next();
      }, function (err: any, req: Request, res: Response, next: NextFunction) {
        d = true;
        next();
      }, function (req, res) {
        expect(a).toBe(false);
        expect(b).toBe(true);
        expect(c).toBe(true);
        expect(d).toBe(false);
        res.sendStatus(204);
      });

      superdeno(app)
        .get("/")
        .expect(204, done);
    });
  });
});
