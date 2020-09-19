import { opine } from "../../mod.ts";
import { superdeno } from "../deps.ts";
import type { RangeParserRanges } from "../../src/types.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".range(size)", function () {
    it("should return parsed ranges", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.range(120));
      });

      superdeno(app)
        .get("/")
        .set("Range", "bytes=0-50,51-100")
        .expect(200, '[{"start":0,"end":50},{"start":51,"end":100}]', done);
    });

    it("should cap to the given size", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.range(75));
      });

      superdeno(app)
        .get("/")
        .set("Range", "bytes=0-100")
        .expect(200, '[{"start":0,"end":74}]', done);
    });

    it("should cap to the given size when open-ended", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json(req.range(75));
      });

      superdeno(app)
        .get("/")
        .set("Range", "bytes=0-")
        .expect(200, '[{"start":0,"end":74}]', done);
    });

    it("should have a .type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json((req.range(120) as RangeParserRanges).type);
      });

      superdeno(app)
        .get("/")
        .set("Range", "bytes=0-100")
        .expect(200, '"bytes"', done);
    });

    it("should accept any type", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.json((req.range(120) as RangeParserRanges).type);
      });

      superdeno(app)
        .get("/")
        .set("Range", "users=0-2")
        .expect(200, '"users"', done);
    });

    it("should return undefined if no range", function (done) {
      const app = opine();

      app.use(function (req, res) {
        res.send(String(req.range(120)));
      });

      superdeno(app)
        .get("/")
        .expect(200, "undefined", done);
    });
  });

  describe(".range(size, options)", function () {
    describe('with "combine: true" option', function () {
      it("should return combined ranges", function (done) {
        const app = opine();

        app.use(function (req, res) {
          res.json(req.range(120, {
            combine: true,
          }));
        });

        superdeno(app)
          .get("/")
          .set("Range", "bytes=0-50,51-100")
          .expect(200, '[{"start":0,"end":100}]', done);
      });
    });
  });
});
