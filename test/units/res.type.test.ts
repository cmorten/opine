import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";

describe("res", function () {
  describe(".type(str)", function () {
    it("should set the Content-Type based on a filename", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.type("foo.js").end('var name = "deno";');
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/javascript; charset=utf-8")
        .end(done);
    });

    it("should default to application/octet-stream", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.type("rawr").end('var name = "deno";');
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/octet-stream", done);
    });

    it("should set the Content-Type with type/subtype", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.type("application/vnd.amazon.ebook")
          .end('var name = "deno";');
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "application/vnd.amazon.ebook", done);
    });
  });
});
