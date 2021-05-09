import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("downloads", () => {
  describe("GET /", async () => {
    it("should have a link to amazing.txt", async () => {
      await superdeno(app)
        .get("/")
        .expect(/href="\/files\/amazing.txt"/);
    });
  });

  describe("GET /files/amazing.txt", () => {
    it("should have a download header", async () => {
      await superdeno(app)
        .get("/files/amazing.txt")
        .expect("Content-Disposition", 'attachment; filename="amazing.txt"')
        .expect(200);
    });
  });

  describe("GET /files/missing.txt", () => {
    it("should respond with 404", async () => {
      await superdeno(app)
        .get("/files/missing.txt")
        .expect(404);
    });
  });
});
