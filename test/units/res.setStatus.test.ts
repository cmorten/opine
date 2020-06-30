import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";

describe("res", function () {
  describe(".status(code)", function () {
    it("should set the response .statusCode", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.setStatus(201).end("Created");
      });

      superdeno(app)
        .get("/")
        .expect("Created")
        .expect(201, done);
    });
  });
});
