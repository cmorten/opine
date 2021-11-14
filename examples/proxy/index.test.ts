import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("proxy", () => {
  it("should proxy all routes to the Opine GitHub page", async () => {
    await superdeno(app)
      .get("/")
      .expect("server", "GitHub.com")
      .expect(
        200,
        /Fast, minimalist web framework for Deno ported from ExpressJS./,
      );
  });
});
