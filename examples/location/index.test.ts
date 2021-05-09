import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("location", () => {
  it("should respond with 'Hello Deno!' on the /home path", (done) => {
    superdeno(app)
      .get("/home")
      .expect(200, "Hello Deno!", done);
  });

  it("should redirect to the /home path from /redirect", (done) => {
    superdeno(app)
      .get("/redirect")
      .expect("Location", "/home")
      .expect(301, done);
  });

  it("should respond with 'Hello Deno!' on the /redirect path once redirected", (
    done,
  ) => {
    superdeno(app)
      .get("/redirect")
      .redirects(1)
      .expect(200, "Hello Deno!", done);
  });
});
