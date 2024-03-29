import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("error-pages", () => {
  describe("GET /", function () {
    it("should respond with page list", function (done) {
      superdeno(app)
        .get("/")
        .expect(/Pages Example/, done);
    });
  });

  describe("Accept: text/html", function () {
    describe("GET /403", function () {
      it("should respond with 403", function (done) {
        superdeno(app)
          .get("/403")
          .expect(403, done);
      });
    });

    describe("GET /404", function () {
      it("should respond with 404", function (done) {
        superdeno(app)
          .get("/404")
          .expect(404, done);
      });
    });

    describe("GET /500", function () {
      it("should respond with 500", function (done) {
        superdeno(app)
          .get("/500")
          .expect(500, done);
      });
    });
  });

  describe("Accept: application/json", function () {
    describe("GET /403", function () {
      it("should respond with 403", function (done) {
        superdeno(app)
          .get("/403")
          .set("Accept", "application/json")
          .expect(403, done);
      });
    });

    describe("GET /404", function () {
      it("should respond with 404", function (done) {
        superdeno(app)
          .get("/404")
          .set("Accept", "application/json")
          .expect(404, { error: "Not Found" }, done);
      });
    });

    describe("GET /500", function () {
      it("should respond with 500", function (done) {
        superdeno(app)
          .get("/500")
          .set("Accept", "application/json")
          .expect(500, done);
      });
    });
  });

  describe("Accept: text/plain", function () {
    describe("GET /403", function () {
      it("should respond with 403", function (done) {
        superdeno(app)
          .get("/403")
          .set("Accept", "text/plain")
          .expect(403, done);
      });
    });

    describe("GET /404", function () {
      it("should respond with 404", function (done) {
        superdeno(app)
          .get("/404")
          .set("Accept", "text/plain")
          .expect(404)
          .expect("Not Found", done);
      });
    });

    describe("GET /500", function () {
      it("should respond with 500", function (done) {
        superdeno(app)
          .get("/500")
          .set("Accept", "text/plain")
          .expect(500, done);
      });
    });
  });
});
