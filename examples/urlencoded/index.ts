/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/urlencoded/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/cmorten/opine/main/examples/urlencoded/index.ts
 *
 *    if you don't!
 */

import { opine, urlencoded } from "../../mod.ts";

const app = opine();

// Use the urlencoded body parser to set `req.parsedBody` to a
// decoded version of the passed payload. Opine also exposes
// this value on the `req.body` property itself for convenience.
app.use(urlencoded());

// Receive `POST` requests to `/` and return the decoded
// version of the passed urlencoded body.
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
  console.log("Try a `POST /` with any urlencoded payload!");
  console.log(
    `curl -X POST http://localhost:3000/ -d 'message%3Dhello%20world%26sender%3Ddeno' -H "Content-Type: application/x-www-form-urlencoded"`,
  );
}

export { app };
