/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/multi-router/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/multi-router/index.ts
 *
 *    if you don't!
 *
 */

import opine from "../../mod.ts";
import APIv1 from "./controllers/APIv1.ts";
import APIv2 from "./controllers/APIv2.ts";

const app = opine();

app.use("/api/v1", APIv1);
app.use("/api/v2", APIv2);

app.get("/", function (req, res) {
  res.send("Hello from root route.");
});

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
