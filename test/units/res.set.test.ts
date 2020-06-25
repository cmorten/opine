import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";
import { superdeno } from "../deps.ts";
import { expect } from "../deps.ts";

describe("res", function () {
  describe(".set(field, value)", function () {
    it("should set the response header field", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/x-foo; charset=utf-8").end();
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/x-foo; charset=utf-8")
        .end(done);
    });

    it("should coerce value to string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("X-Number", 123 as any);
        res.set(
          "Access-Control-Allow-Methods",
          ["POST", "GET", "OPTIONS"] as any,
        );
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("Access-Control-Allow-Methods", "POST,GET,OPTIONS")
        .expect("X-Number", "123")
        .expect(200, "string", done);
    });

    it("should support multiple Set-Cookie headers", function (done) {
      const app = opine();

      const firstCookie =
        "DOCKER_COMPOSE=up;Path=/;Domain=google.com;Secure;HTTPOnly;SameSite=Lax";
      const secondCookie =
        "CARGO=build;Path=/;Domain=google.com;Secure;HTTPOnly;SameSite=Lax";

      app.use(function (req, res) {
        res.set(
          "Set-Cookie",
          firstCookie,
        );
        res.set(
          "Set-Cookie",
          secondCookie,
        );

        res.send(JSON.stringify(Array.from(res.headers?.entries() ?? [])));
      });

      superdeno(app)
        .get("/")
        .expect(200, (err, res) => {
          if (err) {
            done(err);
            return;
          }

          expect(res.text).toMatch(`["set-cookie","${firstCookie}"]`);
          expect(res.text).toMatch(`["set-cookie","${secondCookie}"]`);
          done();
        });
    });

    it("should not set a charset of one is already set", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set("Content-Type", "text/html; charset=lol");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Content-Type", "text/html; charset=lol")
        .expect(200, done);
    });
  });

  describe(".set(object)", function () {
    it("should set multiple fields", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set({
          "X-Foo": "bar",
          "X-Bar": "baz",
        }).end();
      });

      superdeno(app)
        .get("/")
        .expect("X-Foo", "bar")
        .expect("X-Bar", "baz")
        .end(done);
    });

    it("should coerce value to a string", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.set(
          {
            "X-Number": 123 as any,
            "Access-Control-Allow-Methods": ["POST", "GET", "OPTIONS"] as any,
          },
        );
        res.end(typeof res.get("X-Number"));
      });

      superdeno(app)
        .get("/")
        .expect("X-Number", "123")
        .expect("access-control-allow-methods", "POST,GET,OPTIONS")
        .expect(200, "string", done);
    });

    it("should support multiple Set-Cookie headers", function (done) {
      const app = opine();

      const firstCookie =
        "DOCKER_COMPOSE=up;Path=/;Domain=google.com;Secure;HTTPOnly;SameSite=Lax";
      const secondCookie =
        "CARGO=build;Path=/;Domain=google.com;Secure;HTTPOnly;SameSite=Lax";

      app.use(function (req, res) {
        res.set({
          "set-cookie": firstCookie,
          "SET-COOKIE": secondCookie,
        });

        res.send(JSON.stringify(Array.from(res.headers?.entries() ?? [])));
      });

      superdeno(app)
        .get("/")
        .expect(200, (err, res) => {
          if (err) {
            done(err);
            return;
          }

          expect(res.text).toMatch(`["set-cookie","${firstCookie}"]`);
          expect(res.text).toMatch(`["set-cookie","${secondCookie}"]`);
          done();
        });
    });
  });
});
