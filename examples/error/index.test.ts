import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("error", () => {
  describe("GET /", function () {
    it("should respond with 500", function (done) {
      superdeno(app)
        .get("/")
        .expect(500, done);
    });
  });

  describe("GET /next", function () {
    it("should respond with 500", function (done) {
      superdeno(app)
        .get("/next")
        .expect(500, done);
    });
  });

  describe("GET /missing", function () {
    it("should respond with 404", function (done) {
      superdeno(app)
        .get("/missing")
        .expect(404, done);
    });
  });
});
