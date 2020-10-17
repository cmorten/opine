/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/mvc/index.ts
 * 
 */

import { opine, serveStatic, urlencoded } from "../../mod.ts";
import { dirname, join } from "../../deps.ts";
import { renderFileToString } from "./deps.ts";
import type { NextFunction, Request, Response } from "../../src/types.ts";
import boot from "./lib/boot.ts";

const app = opine();
const __dirname = dirname(import.meta.url);

// Set our default template engine to "ejs"
// which prevents the need for using file extensions
app.set("view engine", "ejs");
app.engine(".ejs", renderFileToString);

// set views for error and 404 pages
app.set("views", join(__dirname, "views"));

// Serve static files
app.use(serveStatic(join(__dirname, "public")));

// Parse request bodies (req.body)
app.use(urlencoded({ extended: true }));

// load controllers
await boot(app);

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.setStatus(500).render("5xx");
});

// assume 404 since no middleware responded
app.use(function (req, res) {
  res.setStatus(404).render("404", { url: req.originalUrl });
});

app.listen(3000, () => console.log("Opine started on port 3000"));
