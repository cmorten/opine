/**
 * Run this example using:
 *
 *    deno run --allow-read --allow-net ./examples/cors/index.ts
 *
 */

import opine from "../../mod.ts";
import { opineCors } from "https://deno.land/x/cors@v1.2.1/mod.ts";

const app = opine();

app.use(opineCors());

app.get("/", function (_, res) {
  res.send("Hello Deno!");
});

if (import.meta.main) {
  app.listen(3000, () => console.log("Opine started on port 3000"));
}

export { app };
