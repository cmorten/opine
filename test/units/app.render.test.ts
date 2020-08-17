import { opine } from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { expect } from "../deps.ts";
import { join, dirname, fromFileUrl } from "../../deps.ts";
import { tmpl } from "../support/tmpl.ts";

const __dirname = dirname(import.meta.url);

function createApp() {
  const app = opine();

  app.engine(".tmpl", tmpl);

  return app;
}

describe("app", function () {
  describe(".render(name, fn)", function () {
    it("should support absolute paths", function (done) {
      const app = createApp();

      app.locals.user = { name: "Deno" };

      app.render(
        join(__dirname, "../fixtures", "user.tmpl"),
        function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>Deno</p>");
          done();
        },
      );
    });

    it('should support absolute paths with "view engine"', function (done) {
      const app = createApp();

      app.set("view engine", "tmpl");
      app.locals.user = { name: "Deno" };

      app.render(
        join(__dirname, "../fixtures", "user"),
        function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>Deno</p>");
          done();
        },
      );
    });

    it("should expose app.locals", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.locals.user = { name: "Deno" };

      app.render("user.tmpl", function (err: any, str: string) {
        if (err) return done(err);
        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it("should support index.<engine>", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.set("view engine", "tmpl");

      app.render("blog/post", function (err: any, str: string) {
        if (err) return done(err);
        expect(str).toEqual("<h1>Blog Post</h1>");
        done();
      });
    });

    it("should handle render error throws", function (done) {
      const app = opine();

      function View(this: any, name: string, options: any) {
        this.name = name;
        this.path = "fake";
      }

      View.prototype.render = function (options: any, fn: any) {
        throw new Error("err!");
      };

      app.set("view", View);

      app.render("something", function (err: any, str: string) {
        expect(err).toBeTruthy();
        expect(err.message).toEqual("err!");
        done();
      });
    });

    describe("when the file does not exist", function () {
      it("should provide a helpful error", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures"));
        app.render("rawr.tmpl", function (err: any) {
          expect(err).toBeTruthy();
          expect(err.message).toEqual(
            'Failed to lookup view "rawr.tmpl" in views directory "' +
              fromFileUrl(join(__dirname, "../fixtures")) + '"',
          );
          done();
        });
      });
    });

    describe("when an error occurs", function () {
      it("should invoke the callback", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures"));

        app.render("user.tmpl", function (err: any) {
          expect(err).toBeTruthy();
          expect(err.name).toEqual("RenderError");
          done();
        });
      });
    });

    describe("when an extension is given", function () {
      it("should render the template", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures"));

        app.render("email.tmpl", function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>This is an email</p>");
          done();
        });
      });
    });

    describe('when "view engine" is given', function () {
      it("should render the template", function (done) {
        const app = createApp();

        app.set("view engine", "tmpl");
        app.set("views", join(__dirname, "../fixtures"));

        app.render("email", function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>This is an email</p>");
          done();
        });
      });
    });

    describe('when "views" is given', function () {
      it("should lookup the file in the path", function (done) {
        const app = createApp();

        app.set("views", join(__dirname, "../fixtures", "default_layout"));
        app.locals.user = { name: "Deno" };

        app.render("user.tmpl", function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>Deno</p>");
          done();
        });
      });

      describe("when array of paths", function () {
        it("should lookup the file in the path", function (done) {
          const app = createApp();
          const views = [
            join(__dirname, "../fixtures", "local_layout"),
            join(__dirname, "../fixtures", "default_layout"),
          ];

          app.set("views", views);
          app.locals.user = { name: "Deno" };

          app.render("user.tmpl", function (err: any, str: string) {
            if (err) return done(err);
            expect(str).toEqual("<span>Deno</span>");
            done();
          });
        });

        it("should lookup in later paths until found", function (done) {
          const app = createApp();
          const views = [
            join(__dirname, "../fixtures", "local_layout"),
            join(__dirname, "../fixtures", "default_layout"),
          ];

          app.set("views", views);
          app.locals.name = "Deno";

          app.render("name.tmpl", function (err: any, str: string) {
            if (err) return done(err);
            expect(str).toEqual("<p>Deno</p>");
            done();
          });
        });

        it("should error if file does not exist", function (done) {
          const app = createApp();
          const views = [
            join(__dirname, "../fixtures", "local_layout"),
            join(__dirname, "../fixtures", "default_layout"),
          ];

          app.set("views", views);
          app.locals.name = "Deno";

          app.render("pet.tmpl", function (err: any, str: string) {
            expect(err).toBeTruthy();
            expect(err.message).toEqual(
              'Failed to lookup view "pet.tmpl" in views directories "' +
                fromFileUrl(views[0]) + '" or "' + fromFileUrl(views[1]) + '"',
            );
            done();
          });
        });
      });
    });

    describe('when a "view" constructor is given', function () {
      it("should create an instance of it", function (done) {
        const app = opine();

        function View(this: any, name: string, options: any) {
          this.name = name;
          this.path =
            "path is required by application.js as a signal of success even though it is not used there.";
        }

        View.prototype.render = function (options: any, fn: any) {
          fn(null, "abstract engine");
        };

        app.set("view", View);

        app.render("something", function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("abstract engine");
          done();
        });
      });
    });

    describe("caching", function () {
      it("should always lookup view without cache", function (done) {
        const app = opine();
        let count = 0;

        function View(this: any, name: string, options: any) {
          this.name = name;
          this.path = "fake";
          count++;
        }

        View.prototype.render = function (options: any, fn: any) {
          fn(null, "abstract engine");
        };

        app.set("view cache", false);
        app.set("view", View);

        app.render("something", function (err: any, str: string) {
          if (err) return done(err);
          expect(count).toEqual(1);
          expect(str).toEqual("abstract engine");
          app.render("something", function (err: any, str: string) {
            if (err) return done(err);
            expect(count).toEqual(2);
            expect(str).toEqual("abstract engine");
            done();
          });
        });
      });

      it('should cache with "view cache" setting', function (done) {
        const app = opine();
        let count = 0;

        function View(this: any, name: string, options: any) {
          this.name = name;
          this.path = "fake";
          count++;
        }

        View.prototype.render = function (options: any, fn: any) {
          fn(null, "abstract engine");
        };

        app.set("view cache", true);
        app.set("view", View);

        app.render("something", function (err: any, str: string) {
          if (err) return done(err);
          expect(count).toEqual(1);
          expect(str).toEqual("abstract engine");
          app.render("something", function (err: any, str: string) {
            if (err) return done(err);
            expect(count).toEqual(1);
            expect(str).toEqual("abstract engine");
            done();
          });
        });
      });
    });
  });

  describe(".render(name, options, fn)", function () {
    it("should render the template", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));

      const user = { name: "Deno" };

      app.render("user.tmpl", { user: user }, function (err: any, str: string) {
        if (err) return done(err);
        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it("should expose app.locals", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.locals.user = { name: "Deno" };

      app.render("user.tmpl", {}, function (err: any, str: string) {
        if (err) return done(err);
        expect(str).toEqual("<p>Deno</p>");
        done();
      });
    });

    it("should give precedence to app.render() locals", function (done) {
      const app = createApp();

      app.set("views", join(__dirname, "../fixtures"));
      app.locals.user = { name: "Deno" };
      const steve = { name: "steve" };

      app.render(
        "user.tmpl",
        { user: steve },
        function (err: any, str: string) {
          if (err) return done(err);
          expect(str).toEqual("<p>steve</p>");
          done();
        },
      );
    });

    describe("caching", function () {
      it("should cache with cache option", function (done) {
        const app = opine();
        let count = 0;

        function View(this: any, name: string, options: any) {
          this.name = name;
          this.path = "fake";
          count++;
        }

        View.prototype.render = function (options: any, fn: any) {
          fn(null, "abstract engine");
        };

        app.set("view cache", false);
        app.set("view", View);

        app.render(
          "something",
          { cache: true },
          function (err: any, str: string) {
            if (err) return done(err);
            expect(count).toEqual(1);
            expect(str).toEqual("abstract engine");
            app.render(
              "something",
              { cache: true },
              function (err: any, str: string) {
                if (err) return done(err);
                expect(count).toEqual(1);
                expect(str).toEqual("abstract engine");
                done();
              },
            );
          },
        );
      });
    });
  });
});
