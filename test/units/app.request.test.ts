import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";
import { parseUrl } from "../../src/utils/parseUrl.ts";

describe("app", function () {
  describe(".request", function () {
    it("should extend the request prototype", function (done) {
      const app = opine();

      (app.request as any).querystring = function () {
        return (parseUrl({ url: this.url } as any) as any).search;
      };

      app.use(function (req, res) {
        res.end((req as any).querystring());
      });

      superdeno(app)
        .get("/foo?name=Deno")
        .expect("?name=Deno", done);
    });
  });
});
