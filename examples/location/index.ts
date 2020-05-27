/**
 * Run this example using:
 * 
 *    deno run --allow-net ./examples/location/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/location/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/home", function (req, res, next) {
  res.send("Hello Deno!");
});

app.get("/redirect", function (req, res, next) {
  res.location("/home").sendStatus(301);
});

// You can call listen the same as Express with just
// a port: `app.listen(3000)`, or with any arguments
// that the Deno `http.serve` methods accept. Namely
// an address string, HttpOptions or HttpsOptions
// objects.
app.listen({ port: 3000 });
console.log("Opine started on port 3000");
console.log("Try opening http://localhost:3000/redirect");
