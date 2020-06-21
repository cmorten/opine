/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/dejs/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/dejs/index.ts
 * 
 *    if you don't!
 * 
 */

import { opine, serveStatic } from "../../mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.7.0/mod.ts";
import { join, dirname } from "../../deps.ts";

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
  res.render("users", {
    users,
    title: "EJS example",
    header: "Some users",
  });
});

app.listen(3000);
console.log("Opine started on port 3000");
