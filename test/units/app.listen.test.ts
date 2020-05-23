import opine from "../../mod.ts";
import { describe, it } from "../utils.ts";

describe("app.listen()", () => {
  it("should wrap with an HTTP server", () => {
    const app = opine();

    app.get("/deno", function (req, res) {
      res.end("Hello Deno!");
    });

    const server = app.listen({ port: 9999 });
    server.close();
  });
});
