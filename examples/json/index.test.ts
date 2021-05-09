import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("json", () => {
  it("should respond to JSON POST with the provided JSON", (done) => {
    superdeno(app)
      .post("/")
      .set("Content-Type", "application/json")
      .send({ "message": "Hello Deno!" })
      .expect(200, `{"message":"Hello Deno!"}`, done);
  });
});
