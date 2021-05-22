import opine from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("app.all()", function () {
  it("should add a router per method", function (done) {
    const app = opine();

    app.all("/deno", function (req, res) {
      res.end(req.method);
    });

    superdeno(app)
      .put("/deno")
      .expect("PUT", function () {
        superdeno(app)
          .get("/deno")
          .expect("GET", done);
      });
  });

  it("should run the callback for a method just once", function (done) {
    const app = opine();
    let n = 0;

    app.all("/*", function (_req, _res, next) {
      if (n++) return done(new Error("DELETE called several times"));
      next();
    });

    superdeno(app)
      .delete("/deno")
      .expect(404, done);
  });
});
