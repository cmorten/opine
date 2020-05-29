/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/content-negotiation/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/content-negotiation/index.ts
 *
 *    if you don't!
 *
 */

import { opine } from "../../mod.ts";
import { users } from "./db.ts";
import { Request, Response } from "../../src/types.ts";

const app = opine();

// So either you can deal with different types of formatting
// for expected response in index.ts
app.get("/", (req, res) => {
  res.format({
    html() {
      res.send(
        `<ul>${users.map((user) => `<li>${user.name}</li>`).join("")}</ul>`,
      );
    },

    text() {
      res.send(users.map((user) => ` - ${user.name}\n`).join(""));
    },

    json() {
      res.json(users);
    },
  });
});

// or you could write a tiny middleware like
// this to add a layer of abstraction
// and make things a bit more declarative:
async function format(path: string) {
  const obj = await import(path);

  return function (req: Request, res: Response) {
    res.format(obj);
  };
}

app.get("/users", await format("./users.ts"));

app.listen(3000);
console.log("Opine started on port 3000");
console.log("Try opening http://localhost:3000/ in the browser");
console.log("Try: `curl -X GET http://localhost:3000 -H 'Accept: text/plain'`");
console.log(
  "Try: `curl -X GET http://localhost:3000 -H 'Accept: application/json'`",
);
