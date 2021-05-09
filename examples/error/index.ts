/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/error/index.ts
 * 
 *    if have the repo cloned locally _OR_
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/error/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";
import type { NextFunction, Request, Response } from "../../src/types.ts";

const app = opine();

// error handling middleware have an arity of 4
// instead of the typical (req, res, next),
// otherwise they behave exactly like regular
// middleware, you may have several of them,
// in different orders etc.

function error(err: any, req: Request, res: Response, next: NextFunction) {
  // respond with custom 500 "Internal Server Error".
  res.setStatus(500);
  res.json({ message: "Internal Server Error", error: err.message });
}

app.get("/", function (req, res) {
  // Caught and passed down to the errorHandler middleware
  throw new Error("sync error");
});

app.get("/next", function (req, res, next) {
  // We can also pass exceptions to next()
  // The reason for setTimeout() is to show that
  // next() can be called inside an async operation,
  // in real life it can be a DB read or HTTP request.
  setTimeout(function () {
    next(new Error("async error"));
  });
});

// the error handler is placed after routes
// if it were above it would not receive errors
// from app.get() etc
app.use(error);

if (import.meta.main) {
  // You can call listen the same as Express with just
  // a port: `app.listen(3000)`, or with any arguments
  // that the Deno `http.serve` methods accept. Namely
  // an address string, HttpOptions or HttpsOptions
  // objects.
  app.listen({ port: 3000 });
  console.log("Opine started on port 3000");
}

export { app };
