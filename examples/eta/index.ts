/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read --unstable ./examples/eta/index.ts
 * 
 *    Note: you have to use --unstable because Eta uses the std 'fs' module (which requires --unstable)
 */

import { opine, serveStatic } from "../../mod.ts";
import { renderFile } from "https://deno.land/x/eta@v1.7.0/mod.ts";
import { join, dirname } from "../../deps.ts";

const app = opine();
const __dirname = dirname(import.meta.url);

// Register Eta as .html.
app.engine(".html", renderFile);

// Optional since opine defaults to CWD/views
app.set("views", join(__dirname, "views"));

// Path to our public directory
app.use(serveStatic(join(__dirname, "public")));

// Without this you would need to
// supply the extension to res.render()
// ex: res.render('users.html').
app.set("view engine", "html");

// Disable caching (comment out in production)
app.set("view cache", false);

// Dummy users
const users = [
  { name: "Deno", email: "deno@denoland.com" },
  { name: "SuperDeno", email: "superdeno@denoland.com" },
  { name: "Ada Lovelace", email: "ada@denoland.com" },
  { name: "Deno the Dinosaur", email: "denosaur@denoland.com" },
];

app.get("/", (req, res) => {
  res.set("cache-control", "no-store").render("index", {
    users,
    title: "Eta example",
    header: "Some users",
  });
});

app.listen(3000);
console.log("Opine started on port 3000");
