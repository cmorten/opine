/**
 * Run this example using:
 * 
 *    deno run --allow-net ./examples/hello-world/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/hello-world/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/", function (req, res) {
  res.send("Hello Deno!");
});

// You can call listen the same as Express with just
// a port: `app.listen(3000)`, or with any arguments
// that the Deno `http.serve` methods accept. Namely
// an address string, HttpOptions or HttpsOptions
// objects.
app.listen({ port: 3000 });
console.log("Opine started on port 3000");
