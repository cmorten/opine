import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("raw", () => {
  it("should respond to raw POST with the provided data", (done) => {
    superdeno(app)
      .post("/")
      .set("Content-Type", "application/octet-stream")
      .send("rwaaarrr")
      .expect(200, "rwaaarrr", done);
  });
});
