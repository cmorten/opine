import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".protocol", function () {
    it("should return the protocol string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.protocol);
      });

      superdeno(app)
        .get("/")
        .expect("http", done);
    });
  });
});
