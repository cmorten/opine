import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".xhr", function () {
    it("should return true when X-requested-With is xmlhttprequest", function (
      done,
    ) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.xhr).toBe(true);
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("X-requested-With", "xmlhttprequest")
        .expect(200, done);
    });

    it("should case-insensitive", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.xhr).toBe(true);
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("X-requested-With", "xmlhttprequest")
        .expect(200, done);
    });

    it("should return false otherwise", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.xhr).toBe(false);
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("X-requested-With", "blahblah")
        .expect(200, done);
    });

    it("should return false when not present", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.xhr).toBe(false);
        res.end();
      });

      superdeno(app)
        .get("/")
        .expect(200, done);
    });
  });
});
