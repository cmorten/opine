/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/raw/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/raw/index.ts
 *
 *    if you don't!
 *
 */

import { opine, raw } from "../../mod.ts";

const app = opine();

// Use the raw body parser to set `req.parsedBody` to a
// decoded raw body. Opine also exposes this value on
// the `req.body` property itself for convenience.
app.use(raw());

// Receive `POST` requests to `/` and return the decoded
// raw body.
app.post("/", function (req, res) {
  res.send(req.body);
});

if (import.meta.main) {
  // You can call listen the same as Express with just
  // a port: `app.listen(3000)`, or with any arguments
  // that the Deno `http.serve` methods accept. Namely
  // an address string, HttpOptions or HttpsOptions
  // objects.
  app.listen({ port: 3000 });
  console.log("Opine started on port 3000");
  console.log("Try a `POST /` with any raw payload!");
  console.log(
    `curl -X POST http://localhost:3000/ -d 'rwaaarrr' -H "Content-Type: application/octet-stream"`,
  );
}

export { app };
