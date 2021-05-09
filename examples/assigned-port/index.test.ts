import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("assigned-port", () => {
  it("should respond with 'Hello Deno!' on the root path", (done) => {
    superdeno(app)
      .get("/")
      .expect(200, "Hello Deno!", done);
  });
});
