import { opine } from "../../mod.ts";
import { superdeno, SuperDenoResponse, expect } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("res", function () {
  describe(".clearCookie(name)", function () {
    it("should raise error if no argument is provided", function (done) {
      const app = opine();

      app.use(function (req, res) {
        (res as any).clearCookie().end();
      });

      superdeno(app)
        .get("/")
        .expect(500, done);
    });

    it("should set a cookie passed expiry", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.clearCookie("sid").end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Set-Cookie",
          "sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        )
        .expect(200, done);
    });

    it("should support a second optional argument", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.clearCookie(
          "sid",
          {
            httpOnly: true,
            domain: "google.com",
            name: "ignored-name-property",
            value: "ignored-value-property",
          } as any,
        ).end();
      });

      superdeno(app)
        .get("/")
        .expect(
          (res: SuperDenoResponse) => {
            const cookies: string[] | string = res.get("Set-Cookie");
            const expiredCookie = Array.isArray(cookies) ? cookies[0] : cookies;

            expect(expiredCookie).toMatch(/^sid=;/i);
            expect(expiredCookie).toMatch(/httponly;/i);
            expect(expiredCookie).toMatch(
              "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
            );
            expect(expiredCookie).toMatch(/domain=google\.com/i);
          },
        )
        .expect(200, done);
    });
  });

  describe(".clearCookie(cookie)", function () {
    it("should set a cookie passed expiry", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.clearCookie({ name: "sid", path: "/dada" }).end();
      });

      superdeno(app)
        .get("/")
        .expect(
          "Set-Cookie",
          "sid=; Path=/dada; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        )
        .expect(200, done);
    });
  });

  it("should raise error if input object does not have type `{ name: string }`", function (
    done,
  ) {
    const app = opine();

    app.use(function (req, res) {
      res.clearCookie({} as any).end();
    });

    superdeno(app)
      .get("/")
      .expect(500, done);
  });
});
