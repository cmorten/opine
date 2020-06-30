import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".path", function () {
    it("should return the parsed pathname", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.end(req.path);
      });

      superdeno(app)
        .get("/login?redirect=/post/1/comments")
        .expect("/login", done);
    });
  });
});
