import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".append(field, val)", function () {
    it("should append multiple headers", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.append("Link", "<http://localhost/>");
        next();
      });

      app.use(function (req, res) {
        res.append("Link", "<http://localhost:80/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://localhost/>, <http://localhost:80/>", done);
    });

    it("should accept array of values", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.append(
          "Link",
          [
            'https://www.google.com; rel="dns-prefetch"',
            'https://www.youtube.com; rel="preconnect"',
          ],
        );

        res.append("cache-control", ["public", "max-age=604800", "immutable"]);
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Link",
          'https://www.google.com; rel="dns-prefetch", https://www.youtube.com; rel="preconnect"',
        )
        .expect("Cache-Control", "public, max-age=604800, immutable")
        .expect(200, done);
    });

    it("should ignore empty arrays", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.set("cache-control", "no-store").append("cache-control", []).end();
      });

      superdeno(app)
        .get("/")
        .expect("Cache-Control", "no-store")
        .expect(200, done);
    });

    it("should get reset by res.set(field, val)", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.append("Link", "<http://localhost/>");
        res.append("Link", "<http://localhost:80/>");
        next();
      });

      app.use(function (req, res) {
        res.set("Link", "<http://127.0.0.1/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://127.0.0.1/>", done);
    });

    it("should work with res.set(field, val) first", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.set("Link", "<http://localhost/>");
        next();
      });

      app.use(function (req, res) {
        res.append("Link", "<http://localhost:80/>");
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect("Link", "<http://localhost/>, <http://localhost:80/>", done);
    });

    it("should work with cookies", function (done) {
      const app = opine();

      app.use(function (req, res, next) {
        res.cookie({ name: "foo", value: "bar" });
        next();
      });

      app.use(function (req, res) {
        res.append("set-cookie", "bar=baz");
        res.append("set-cookie", ["bar=bang", "curl=wget; Path=/"]);
        res.append("set-cookie", ["bar=bang", "express=js; Path=/"]);

        // Holds the values of all the `set-cookie` headers sent.
        const cookieVals = [];

        for (const [key, val] of res.headers!) {
          if (key.toLowerCase() === "set-cookie") {
            cookieVals.push(val);
          }
        }

        res.json({ cookies: cookieVals.sort() });
      });

      superdeno(app)
        .get("/")
        .expect(200, {
          cookies: [
            "bar=bang",
            "bar=bang",
            "bar=baz",
            "curl=wget; Path=/",
            "express=js; Path=/",
            "foo=bar; Path=/",
          ],
        }, done);
    });
  });
});
