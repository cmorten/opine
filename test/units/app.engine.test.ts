import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect } from "../deps.ts";
import { dirname, join } from "../../deps.ts";

const __dirname = dirname(import.meta.url);

async function render(path: string, options: any) {
  const str = await Deno.readTextFile(path);

  return str.replace("{{user.name}}", options.user.name);
}

describe("app", function () {
  describe(".engine(ext, fn)", function () {
    it("should map a template engine", function (done) {
      const app = opine();

      app.set("views", join(__dirname, "../fixtures"));
      app.engine(".html", render);
      app.locals.user = { name: "Deno" };

      app.render("user.html", function (err: any, str: string) {
        if (err) {
          return done(err);
        }

        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it('should work without leading "."', function (done) {
      const app = opine();

      app.set("views", join(__dirname, "../fixtures"));
      app.engine("html", render);
      app.locals.user = { name: "Deno" };

      app.render("user.html", function (err: any, str: string) {
        if (err) {
          return done(err);
        }

        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it('should work "view engine" setting', function (done) {
      const app = opine();

      app.set("views", join(__dirname, "../fixtures"));
      app.engine("html", render);
      app.set("view engine", "html");
      app.locals.user = { name: "Deno" };

      app.render("user.html", function (err: any, str: string) {
        if (err) {
          return done(err);
        }

        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it('should work "view engine" with leading "."', function (done) {
      const app = opine();

      app.set("views", join(__dirname, "../fixtures"));
      app.engine(".html", render);
      app.set("view engine", ".html");
      app.locals.user = { name: "Deno" };

      app.render("user.html", function (err: any, str: string) {
        if (err) {
          return done(err);
        }

        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });
  });
});
