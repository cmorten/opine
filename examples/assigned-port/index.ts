/**
 * Run this example using:
 * 
 *    deno run --allow-net ./examples/assigned-port/index.ts
 * 
 *    if have the repo cloned locally OR
 * 
 *    deno run --allow-net https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/assigned-port/index.ts
 * 
 *    if you don't!
 * 
 */

import opine from "../../mod.ts";

const app = opine();

app.get("/", function (req, res) {
  res.send("Hello Deno!");
});

// Providing no port results in an available port being assigned
// for you. You can determine the port using the returned Server
// object.
const server = app.listen();
const address = server.listener.addr as Deno.NetAddr;
console.log(`Server started on ${address.hostname}:${address.port}`);
