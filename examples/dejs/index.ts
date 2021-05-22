/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/dejs/index.ts
 *
 * after cloning the repo locally.
 *
 */

import { opine, serveStatic } from "../../mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.9.3/mod.ts";
import { dirname, join } from "../../deps.ts";

const app = opine();
const __dirname = dirname(import.meta.url);

// Register ejs as .html.
app.engine(".html", renderFileToString);

// Optional since opine defaults to CWD/views
app.set("views", join(__dirname, "views"));

// Path to our public directory
app.use(serveStatic(join(__dirname, "public")));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set("view engine", "html");

// Dummy users
const users = [
  { name: "Deno", email: "deno@denoland.com" },
  { name: "SuperDeno", email: "superdeno@denoland.com" },
];

app.get("/", (req, res) => {
  res.set("cache-control", "no-store").render("users", {
    users,
    title: "EJS example",
    header: "Some users",
  });
});

if (import.meta.main) {
  app.listen(3000);
  console.log("Opine started on port 3000");
}

export { app };
