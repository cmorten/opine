import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".get(field)", function () {
    it("should get the response header field", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/x-foo");
        res.send(res.get("Content-Type"));
      });

      superdeno(app).get("/").expect(200, /text\/x\-foo/, done);
    });
  });
});
