import opine from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("app.delete()", function () {
  it("should alias app.delete()", function (done) {
    const app = opine();

    app.delete("/deno", function (_req, res) {
      res.end("deleted deno!");
    });

    superdeno(app)
      .delete("/deno")
      .expect("deleted deno!", done);
  });
});
