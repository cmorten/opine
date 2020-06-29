import { opine } from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("req", function () {
  describe(".acceptsEncodings", function () {
    it("should be true if encoding accepted", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.acceptsEncodings("gzip")).toBeTruthy();
        expect(req.acceptsEncodings("deflate")).toBeTruthy();
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("Accept-Encoding", "gzip, deflate")
        .expect(200, done);
    });

    it("should be false if encoding not accepted", function (done) {
      const app = opine();

      app.use(function (req, res) {
        expect(req.acceptsEncodings("bogus")).toBeFalsy();
        res.end();
      });

      superdeno(app)
        .get("/")
        .set("Accept-Encoding", "gzip, deflate")
        .expect(200, done);
    });
  });
});
