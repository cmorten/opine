/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/error/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/error/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";
import { Response, Request, NextFunction } from "../../typings/index.d.ts";

const app = opine();

// error handling middleware have an arity of 4
// instead of the typical (req, res, next),
// otherwise they behave exactly like regular
// middleware, you may have several of them,
// in different orders etc.
function error(err: any, _req: Request, res: Response, _next: NextFunction) {
  res.setStatus(500);
  res.json({ message: "Internal Server Error", error: err.message });
}

app.get("/", function (_req, _res) {
  throw new Error("sync error");
});

app.get("/next", function (_req, _res, next) {
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

app.listen({ port: 3000 });
console.log("Opine started on port 3000");
