/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/hello-world/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/hello-world/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/", function (_req, res) {
  res.send("Hello World");
});

app.listen({ port: 3000 });
console.log("Opine started on port 3000");
