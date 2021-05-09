import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("text", () => {
  it("should respond to text POST with the provided text", (done) => {
    superdeno(app)
      .post("/")
      .set("Content-Type", "text/plain")
      .send("Hello Deno!")
      .expect(200, "Hello Deno!", done);
  });
});
