/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/redirect/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/redirect/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/home", function (req, res) {
  res.send("Hello Deno!");
});

// Redirects from `/redirect` to `/home` using a permanent redirect.
//
// To learn more about the Location header, please refer to
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location
app.get("/redirect", function (req, res) {
  const status = 301;
  res.redirect(status, `/home?status=${status}`);
});

// Redirects from `/relative/redirect/` to `/home` using:
// 1. a temporary redirect
// 2. a relative location.
app.get("/relative/redirect", function (req, res) {
  res.redirect("../home?status=302");
});

// You can call listen the same as Express with just
// a port: `app.listen(3000)`, or with any arguments
// that the Deno `http.serve` methods accept. Namely
// an address string, HttpOptions or HttpsOptions
// objects.
app.listen({ port: 3000 });
console.log("Opine started on port 3000");
console.log(
  `Try opening http://localhost:3000/redirect or http://localhost:3000/relative/redirect`,
);
