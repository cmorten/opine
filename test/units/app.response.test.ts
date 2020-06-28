import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("app", function () {
  describe(".response", function () {
    it("should extend the response prototype", function (done) {
      const app = opine();

      (app.response as any).shout = function (str: string) {
        this.send(str.toUpperCase());
      };

      app.use(function (req, res) {
        (res as any).shout("hey");
      });

      superdeno(app)
        .get("/")
        .expect("HEY", done);
    });

    it("should not be influenced by other app protos", function (done) {
      const app = opine();
      const app2 = opine();

      (app.response as any).shout = function (str: string) {
        this.send(str.toUpperCase());
      };

      (app2.response as any).shout = function (str: string) {
        this.send(str);
      };

      app.use(function (req, res) {
        (res as any).shout("hey");
      });

      superdeno(app)
        .get("/")
        .expect("HEY", done);
    });
  });
});
