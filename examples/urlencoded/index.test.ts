import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("urlencoded", () => {
  it("should respond to a urlencoded POST with the decoded payload as JSON", (
    done,
  ) => {
    superdeno(app)
      .post("/")
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send("message%3Dhello%20world%26sender%3Ddeno")
      .expect(200, `{"message":"hello world","sender":"deno"}`, done);
  });
});
