/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read --allow-env ./examples/error-pages/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read --allow-env https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/error-pages/index.ts
 * 
 *    if you don't!
 * 
 * To turn off verbose errors, set `DENO_ENV=production`. For example:
 * 
 *    DENO_ENV=production deno run --allow-net --allow-read --allow-env ./examples/error-pages/index.ts
 * 
 */

import { opine, serveStatic } from "../../mod.ts";
import { renderFileToString } from "https://deno.land/x/dejs@0.7.0/mod.ts";
import { join, dirname } from "../../deps.ts";
import { Request, Response, NextFunction } from "../../src/types.ts";

const env = Deno.env.get("DENO_ENV");
const silent = env === "test";

const logger = () =>
  (req: Request, res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  };

const app = opine();
const __dirname = dirname(import.meta.url);

// Register ejs as .html.
app.engine(".ejs", renderFileToString);

// general config
app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");

// Path to our public directory
app.use(serveStatic(join(__dirname, "public")));

// our custom "verbose errors" setting
// which we can use in the templates
// via settings['verbose errors']
app.enable("verbose errors");

// disable them in production
// use $ DENO_ENV=production deno run --allow-net --allow-read ./examples/error-pages/index.ts
if (env === "production") {
  app.disable("verbose errors");
}

silent || app.use(logger());

// Routes
app.get("/", function (req, res) {
  res.render("index.ejs");
});

app.get("/404", function (req, res, next) {
  // trigger a 404 since no other middleware
  // will match /404 after this one, and we're not
  // responding here
  next();
});

app.get("/403", function (req, res, next) {
  // trigger a 403 error
  const err = new Error("Not Allowed!");
  (err as any).status = 403;
  next(err);
});

app.get("/500", function (req, res, next) {
  // trigger a generic (500) error
  next(new Error("Panicking Deno!"));
});

// Error handlers

// Since this is the last non-error-handling
// middleware used, we assume 404, as nothing else
// responded.

// $ curl http://localhost:3000/notfound
// $ curl http://localhost:3000/notfound -H "Accept: application/json"
// $ curl http://localhost:3000/notfound -H "Accept: text/plain"

app.use(function (req, res, next) {
  res.setStatus(404);

  res.format({
    html() {
      res.render("404", { url: req.url });
    },
    json() {
      res.json({ error: "Not Found" });
    },
    default() {
      res.type("txt").send("Not Found");
    },
  });
});

// error-handling middleware, take the same form
// as regular middleware, however they require an
// arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling
// middleware.

// If we were to next() here any remaining non-error-handling
// middleware would then be executed, or if we next(err) to
// continue passing the error, only error-handling middleware
// would remain being executed, however here
// we simply respond with an error page.

app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
  // we may use properties of the error object
  // here and next(err) appropriately, or if
  // we possibly recovered from the error, simply next().
  res.setStatus(err.status || 500);
  res.render("500", { error: err });
});

app.listen(3000);
console.log("Opine started on port 3000");
