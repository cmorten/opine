import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("redirect", () => {
  describe("GET /home", () => {
    it("should respond with 'Hello Deno!' on the /home path", (done) => {
      superdeno(app)
        .get("/home")
        .expect(200, "Hello Deno!", done);
    });
  });

  describe("GET /redirect", () => {
    it("should redirect to the /home path from /redirect", (done) => {
      superdeno(app)
        .get("/redirect")
        .expect("Location", "/home?status=301")
        .expect(301, done);
    });

    it("should respond with 'Hello Deno!' on the /redirect path once redirected", (done) => {
      superdeno(app)
        .get("/redirect")
        .redirects(1)
        .expect(200, "Hello Deno!", done);
    });
  });

  describe("GET /relative/redirect", () => {
    it("should redirect to the /home path from /relative/redirect", (done) => {
      superdeno(app)
        .get("/relative/redirect")
        .expect("Location", "../home?status=302")
        .expect(302, done);
    });

    it("should respond with 'Hello Deno!' on the /relative/redirect path once redirected", (done) => {
      superdeno(app)
        .get("/relative/redirect")
        .redirects(1)
        .expect(200, "Hello Deno!", done);
    });
  });
});
