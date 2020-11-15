/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/json/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/json/index.ts
 * 
 *    if you don't!
 * 
 */

import { json, opine } from "../../mod.ts";

const app = opine();

// Use the JSON body parser to set `req.body` to the
// passed JSON payload.
app.use(json());

// Receive `POST` requests to `/` and return the passed
// JSON body.
app.post("/", function (req, res) {
  res.send(req.body);
});

// You can call listen the same as Express with just
// a port: `app.listen(3000)`, or with any arguments
// that the Deno `http.serve` methods accept. Namely
// an address string, HttpOptions or HttpsOptions
// objects.
app.listen({ port: 3000 });
console.log("Opine started on port 3000");
console.log("Try a `POST /` with any JSON payload!");
console.log(
  `curl -X POST http://localhost:3000/ -d '{"message": "Hello Deno!"}' -H "Content-Type: application/json"`,
);
