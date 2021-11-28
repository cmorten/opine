import opine from "../../mod.ts";
import { expect, superdeno } from "../deps.ts";
import { describe, it } from "../utils.ts";

describe("HEAD", function () {
  it("should default to GET", function (done) {
    const app = opine();

    app.get("/deno", function (_req, res) {
      res.send("deno");
    });

    superdeno(app)
      .head("/deno")
      .expect(200, done);
  });

  it("should output the same headers as GET requests", function (done) {
    const app = opine();

    app.get("/deno", function (_req, res) {
      // send() detects HEAD
      res.send("deno");
    });

    superdeno(app)
      .get("/deno")
      .expect(200, function (err, res) {
        if (err) {
          return done(err);
        }

        const headers = res.header;

        superdeno(app)
          .get("/deno")
          .expect(200, function (err, res) {
            if (err) {
              return done(err);
            }

            delete headers.date;
            delete res.header.date;
            expect(res.header).toEqual(headers);
            done();
          });
      });
  });
});

describe("app.head()", function () {
  it("should override", function (done) {
    const app = opine();
    let called = false;

    app.head("/deno", function (_req, res) {
      called = true;
      res.end("");
    });

    app.get("/deno", function () {
      throw new Error("should not be called");
    });

    superdeno(app)
      .head("/deno")
      .expect(200, function () {
        expect(called).toBeTruthy();
        done();
      });
  });
});
