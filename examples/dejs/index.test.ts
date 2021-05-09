import { superdeno } from "../../test/deps.ts";
import { describe, it } from "../../test/utils.ts";
import { app } from "./index.ts";

describe("dejs", () => {
  it("should render an ejs template on the root path", async () => {
    await superdeno(app)
      .get("/")
      .expect(
        200,
        '<!--\n  This template assumes you are running the example from the root\n  of the Opine project. The `dejs` doesn\'t resolve included paths\n  relative to the current template.\n-->\n<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <title>EJS example</title>\n  <link rel="stylesheet" href="/stylesheets/style.css">\n</head>\n<body>\n\n\n<h1>Users</h1>\n<ul id="users">\n  \n    <li>Deno &lt;deno@denoland.com&gt;</li>\n  \n    <li>SuperDeno &lt;superdeno@denoland.com&gt;</li>\n  \n</ul>\n\n</body>\n</html>\n\n',
      );
  });

  it("should set a cache-control header", async () => {
    await superdeno(app)
      .get("/")
      .expect("cache-control", "no-store");
  });
});
