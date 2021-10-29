import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";
import { dirname, join } from "../../deps.ts";
import { tmpl } from "../support/tmpl.ts";

const __dirname = dirname(import.meta.url);

function createApp() {
  const app = opine();

  app.engine(".tmpl", tmpl);

  return app;
}

describe("res", function () {
  describe(".render(name)", function () {
    it("should support absolute paths", function (done) {
      const app = createApp();

      app.locals.user = { name: "Deno" };

      app.use(function (req, res) {
        res.render(join(__dirname, "../fixtures", "user.tmpl"));
      });

      superdeno(app)
        .get("/")
        .expect("<p>Deno</p>", done);
    });

    it('should support absolute paths with "view engine"', function (done) {
      const app = createApp();

      app.locals.user = { name: "Deno" };
      app.set("view engine", "tmpl");

      app.use(function (req, res) {
        res.render(join(__dirname, "../fixtures", "user"));
      });

      superdeno(app)
        .get("/")
        .expect("<p>Deno</p>", done);
    });

    it(
      'should error without "view engine" set and file extension to a non-engine module',
      function (
        done,
      ) {
        const app = createApp();

        app.locals.user = { name: "Deno" };

        app.use(function (req, res) {
          res.render(join(__dirname, "../fixtures", "broken.send"));
        });

        superdeno(app)
          .get("/")
          .expect(500, /Could not find a view engine for extension/, done);
      },
    );

    it(
      'should error without "view engine" set and no file extension',
      function (
        done,
      ) {
        const app = createApp();

        app.locals.user = { name: "Deno" };

        app.use(function (req, res) {
          res.render(join(__dirname, "../fixtures", "user"));
        });

        superdeno(app)
          .get("/")
          .expect(500, /No default engine was specified/, done);
      },
    );

    it("should expose app.locals", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.locals.user = { name: "Deno" };

      app.use(function (req, res) {
        res.render("user.tmpl");
      });

      superdeno(app)
        .get("/")
        .expect("<p>Deno</p>", done);
    });

    it("should expose app.locals with `name` property", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.locals.name = "Deno";

      app.use(function (req, res) {
        res.render("name.tmpl");
      });

      superdeno(app)
        .get("/")
        .expect("<p>Deno</p>", done);
    });

    it("should support index.<engine>", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.set("view engine", "tmpl");

      app.use(function (req, res) {
        res.render("blog/post");
      });

      superdeno(app)
        .get("/")
        .expect("<h1>Blog Post</h1>", done);
    });

    describe("when an error occurs", function () {
      it("should next(err)", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures"));

        app.use(function (req, res) {
          res.render("user.tmpl");
        });

        app.use(function (err: any, req: any, res: any, next: any) {
          res.setStatus(500).send("got error: " + err.name);
        });

        superdeno(app)
          .get("/")
          .expect(500, "got error: RenderError", done);
      });
    });

    describe('when "view engine" is given', function () {
      it("should render the template", function (done) {
        const app = createApp();

        app.set("view engine", "tmpl");
        app.set("views", join(__dirname, "../fixtures"));

        app.use(function (req, res) {
          res.render("email");
        });

        superdeno(app)
          .get("/")
          .expect("<p>This is an email</p>", done);
      });
    });

    describe('when "views" is given', function () {
      it("should lookup the file in the path", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures", "default_layout"));

        app.use(function (req, res) {
          res.render("user.tmpl", { user: { name: "Deno" } });
        });

        superdeno(app)
          .get("/")
          .expect("<p>Deno</p>", done);
      });

      describe("when array of paths", function () {
        it("should lookup the file in the path", function (done) {
          const app = createApp();
          const views = [
            join(__dirname, "../fixtures", "local_layout"),
            join(__dirname, "../fixtures", "default_layout"),
          ];

          app.set("views", views);

          app.use(function (req, res) {
            res.render("user.tmpl", { user: { name: "Deno" } });
          });

          superdeno(app)
            .get("/")
            .expect("<span>Deno</span>", done);
        });

        it("should lookup in later paths until found", function (done) {
          const app = createApp();
          const views = [
            join(__dirname, "../fixtures", "local_layout"),
            join(__dirname, "../fixtures", "default_layout"),
          ];

          app.set("views", views);

          app.use(function (req, res) {
            res.render("name.tmpl", { name: "Deno" });
          });

          superdeno(app)
            .get("/")
            .expect("<p>Deno</p>", done);
        });
      });
    });
  });
});
