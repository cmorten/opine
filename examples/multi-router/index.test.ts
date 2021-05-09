import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("multi-router", () => {
  describe("GET /", function () {
    it("should respond with root handler", function (done) {
      superdeno(app)
        .get("/")
        .expect(200, "Hello from root route.", done);
    });
  });

  describe("GET /api/v1/", function () {
    it("should respond with APIv1 root handler", function (done) {
      superdeno(app)
        .get("/api/v1/")
        .expect(200, "Hello from APIv1 root route.", done);
    });
  });

  describe("GET /api/v1/users", function () {
    it("should respond with users from APIv1", function (done) {
      superdeno(app)
        .get("/api/v1/users")
        .expect(200, "List of APIv1 users.", done);
    });
  });

  describe("GET /api/v2/", function () {
    it("should respond with APIv2 root handler", function (done) {
      superdeno(app)
        .get("/api/v2/")
        .expect(200, "Hello from APIv2 root route.", done);
    });
  });

  describe("GET /api/v2/users", function () {
    it("should respond with users from APIv2", function (done) {
      superdeno(app)
        .get("/api/v2/users")
        .expect(200, "List of APIv2 users.", done);
    });
  });
});
