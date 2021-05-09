import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

const toOsNewlines = (str: string) =>
  Deno.build.os === "windows" ? str.replaceAll("\n", "\r\n") : str;

describe("static-files", () => {
  describe("`public` on /", () => {
    it("should serve hello.txt", async () => {
      await superdeno(app)
        .get("/hello.txt")
        .expect(200, "Hello Deno!");
    });

    it("should serve js/app.js", async () => {
      await superdeno(app)
        .get("/js/app.js")
        .expect(200, toOsNewlines("// app.js\n"));
    });

    it("should serve js/helper.js", async () => {
      await superdeno(app)
        .get("/js/helper.js")
        .expect(200, toOsNewlines("// helper.js\n"));
    });

    it("should serve css/style.css", async () => {
      await superdeno(app)
        .get("/css/style.css")
        .expect(
          200,
          toOsNewlines(
            "/* style.css */\nbody {\n  background: darkslategrey;\n}\n",
          ),
        );
    });
  });

  describe("`public` on /static", () => {
    it("should serve hello.txt", async () => {
      await superdeno(app)
        .get("/static/hello.txt")
        .expect(200, "Hello Deno!");
    });

    it("should serve js/app.js", async () => {
      await superdeno(app)
        .get("/static/js/app.js")
        .expect(200, toOsNewlines("// app.js\n"));
    });

    it("should serve js/helper.js", async () => {
      await superdeno(app)
        .get("/static/js/helper.js")
        .expect(200, toOsNewlines("// helper.js\n"));
    });

    it("should serve css/style.css", async () => {
      await superdeno(app)
        .get("/static/css/style.css")
        .expect(
          200,
          toOsNewlines(
            "/* style.css */\nbody {\n  background: darkslategrey;\n}\n",
          ),
        );
    });
  });

  describe("`public/css` on /", () => {
    it("should serve css/style.css", async () => {
      await superdeno(app)
        .get("/style.css")
        .expect(
          200,
          toOsNewlines(
            "/* style.css */\nbody {\n  background: darkslategrey;\n}\n",
          ),
        );
    });
  });
});
