import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("content-negotiation", () => {
  describe("when accepting HTML", () => {
    it("should respond with HTML on the root path", (done) => {
      superdeno(app)
        .get("/")
        .accept("text/html")
        .expect("Content-Type", /text\/html/)
        .expect(
          200,
          "<ul><li>Deno</li><li>Opine</li><li>Express</li></ul>",
          done,
        );
    });

    it("should respond with HTML on the users path", (done) => {
      superdeno(app)
        .get("/users")
        .accept("text/html")
        .expect("Content-Type", /text\/html/)
        .expect(
          200,
          "<ul><li>Deno</li><li>Opine</li><li>Express</li></ul>",
          done,
        );
    });
  });

  describe("when accepting text", () => {
    it("should respond with text on the root path", (done) => {
      superdeno(app)
        .get("/")
        .accept("text/plain")
        .expect("Content-Type", /text\/plain/)
        .expect(
          200,
          " - Deno\n - Opine\n - Express\n",
          done,
        );
    });

    it("should respond with text on the users path", (done) => {
      superdeno(app)
        .get("/users")
        .accept("text/plain")
        .expect("Content-Type", /text\/plain/)
        .expect(
          200,
          " - Deno\n - Opine\n - Express\n",
          done,
        );
    });
  });

  describe("when accepting JSON", () => {
    it("should respond with JSON on the root path", (done) => {
      superdeno(app)
        .get("/")
        .accept("application/json")
        .expect("Content-Type", /application\/json/)
        .expect(
          200,
          '[{"name":"Deno"},{"name":"Opine"},{"name":"Express"}]',
          done,
        );
    });

    it("should respond with JSON on the users path", (done) => {
      superdeno(app)
        .get("/users")
        .accept("application/json")
        .expect("Content-Type", /application\/json/)
        .expect(
          200,
          '[{"name":"Deno"},{"name":"Opine"},{"name":"Express"}]',
          done,
        );
    });
  });
});
