import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

function createApp() {
  const app = opine();

  app.use(function (req, res) {
    res.send(req.query);
  });

  return app;
}

describe("req", function () {
  describe(".query", function () {
    it("should default to {}", function (done) {
      const app = createApp();

      superdeno(app)
        .get("/")
        .expect(200, "{}", done);
    });

    it("should not parse complex keys", function (done) {
      const app = createApp();

      superdeno(app)
        .get("/?user[name]=deno")
        .expect(200, '{"user[name]":"deno"}', done);
    });
  });
});
