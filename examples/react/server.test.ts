import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./server.tsx";

describe("react", () => {
  describe("GET /scripts/client.js", () => {
    it("should serve the client JS at /scripts/client.js", async () => {
      await superdeno(app)
        .get("/scripts/client.js")
        .expect("Content-Type", /application\/javascript/)
        .expect(200, /Deno Doggo List/);
    });
  });

  describe("GET /", () => {
    it("should render an eta template on the root path", async () => {
      await superdeno(app)
        .get("/")
        .expect(
          200,
          '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>React Example</title>\n  <link rel="stylesheet" href="/stylesheets/style.css">\n  <script type="module" src="/scripts/client.js"></script>\n</head>\n<body>\n\n<main id="root"><header class="title_header"><h1 class="title_text">Deno Doggo List</h1></header><p class="app_loading">Loading Doggos...</p></main>\n</body>\n</html>\n',
        );
    });

    it("should set a cache-control header", async () => {
      await superdeno(app)
        .get("/")
        .expect("cache-control", "no-store");
    });
  });

  describe("GET /api/v1/doggos", () => {
    it("should respond to API requests with doggo JSON containing the desired number of doggos", async () => {
      await superdeno(app)
        .get("/api/v1/doggos?count=2")
        .expect("Content-Type", /application\/json/)
        .expect(
          200,
          `[{"id":1,"alt":"A cute doggo","src":"https://placedog.net/400/225?id=1"},{"id":2,"alt":"A cute doggo","src":"https://placedog.net/400/225?id=2"}]`,
        );
    });
  });
});
