import { opine } from "../../mod.ts";
import { expect, superdeno, readAll } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("middleware", function () {
  describe(".next()", function () {
    it("should behave like connect", function (done) {
      const app = opine();
      const calls: any[] = [];

      app.use(function (req, res, next) {
        calls.push("one");
        next();
      });

      app.use(function (req, res, next) {
        calls.push("two");
        next();
      });

      app.use(async function (req, res) {
        res.set("Content-Type", "application/json; charset=utf-8");
        const raw = await readAll(req.body);
        const data = (new TextDecoder()).decode(raw);
        res.end(data);
      });

      superdeno(app)
        .post("/")
        .set("Content-Type", "application/json")
        .send('{"foo":"bar"}')
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(function () {
          expect(calls).toEqual(["one", "two"]);
        })
        .expect(200, '{"foo":"bar"}', done);
    });
  });
});
