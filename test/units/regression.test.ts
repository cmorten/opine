import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("throw after .end()", function () {
  it("should fail gracefully", function (done) {
    const app = opine();

    app.get("/", function (req, res) {
      res.end("yay");
      throw new Error("boom");
    });

    superdeno(app)
      .get("/")
      .expect("yay")
      .expect(200, done);
  });
});
