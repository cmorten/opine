import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("hello-world", () => {
  it("should respond with 'Hello Deno!' on the root path", (done) => {
    superdeno(app)
      .get("/")
      .expect(200, "Hello Deno!", done);
  });
});
