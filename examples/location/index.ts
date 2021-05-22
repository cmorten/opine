/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/location/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/location/index.ts
 *
 *    if you don't!
 *
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/home", function (_req, res) {
  res.send("Hello Deno!");
});

// We set the Location header using `res.location()` and then
// send the response with a 301.
//
// To learn more about the Location header, please refer to
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location
app.get("/redirect", function (_req, res) {
  res.location("/home").sendStatus(301);
});

if (import.meta.main) {
  // You can call listen the same as Express with just
  // a port: `app.listen(3000)`, or with any arguments
  // that the Deno `http.serve` methods accept. Namely
  // an address string, HttpOptions or HttpsOptions
  // objects.
  app.listen({ port: 3000 });
  console.log("Opine started on port 3000");
  console.log("Try opening http://localhost:3000/redirect");
}

export { app };
