import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";

describe("app.listen()", () => {
  describe("when passing a port", () => {
    it("should wrap with an HTTP server", () => {
      const app = opine();

      app.get("/deno", function (req, res) {
        res.end("Hello Deno!");
      });

      const server = app.listen(9999);
      server.close();
    });
  });

  describe("when passing an address", () => {
    it("should wrap with an HTTP server", () => {
      const app = opine();

      app.get("/deno", function (req, res) {
        res.end("Hello Deno!");
      });

      const server = app.listen("localhost:9999");
      server.close();
    });
  });

  describe("when passing an object", () => {
    it("should wrap with an HTTP server", () => {
      const app = opine();

      app.get("/deno", function (req, res) {
        res.end("Hello Deno!");
      });

      const server = app.listen({ port: 9999 });
      server.close();
    });
  });
});
