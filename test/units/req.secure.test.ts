import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".secure", function () {
    it("should return false when http", function (done) {
      const app = opine();

      app.get("/", function (req, res) {
        res.send(req.secure ? "yes" : "no");
      });

      superdeno(app)
        .get("/")
        .expect("no", done);
    });
  });
});
