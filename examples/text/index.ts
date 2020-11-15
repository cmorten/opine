/**
 * Run this example using:
 * 
 *    deno run --allow-net --allow-read ./examples/text/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/text/index.ts
 * 
 *    if you don't!
 * 
 */

import { opine, text } from "../../mod.ts";

const app = opine();

// Use the text body parser to set `req.body` to a
// decoded text body.
app.use(text());

// Receive `POST` requests to `/` and return the decoded
// text body.
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
console.log("Try a `POST /` with any text payload!");
console.log(
  `curl -X POST http://localhost:3000/ -d 'Hello Deno!' -H "Content-Type: text/plain"`,
);
