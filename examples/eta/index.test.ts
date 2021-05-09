import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("eta", () => {
  it("should render an eta template on the root path", async () => {
    await superdeno(app)
      .get("/")
      .expect(
        200,
        '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n<meta name="viewport" content="width=device-width,initial-scale=1" />\n<title>Eta example</title>\n<link rel="stylesheet" href="/stylesheets/style.css" />\n  </head>\n  <body>\n    \n<div id="content">\n  <h1>Users</h1>\n<ul id="users">\n          <li>Deno &lt;deno@denoland.com&gt;</li>\n          <li>SuperDeno &lt;superdeno@denoland.com&gt;</li>\n          <li>Deno the Dinosaur &lt;denosaur@denoland.com&gt;</li>\n  </ul>\n</div>\n<footer>This is a footer!</footer>\n  </body>\n</html>\n',
      );
  });

  it("should set a cache-control header", async () => {
    await superdeno(app)
      .get("/")
      .expect("cache-control", "no-store");
  });
});
