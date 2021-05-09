import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("cors", () => {
  it("should respond with 'Hello Deno!' on the root path", async () => {
    await superdeno(app)
      .get("/")
      .expect(200, "Hello Deno!");
  });

  it("should apply CORS headers to the response", async () => {
    await superdeno(app)
      .get("/")
      .expect("Access-Control-Allow-Origin", "*");
  });
});
