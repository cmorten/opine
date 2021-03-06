# content-negotiation

An example of how to perform content negotiation using the `res.format()` method
in an Opine server.

## How to run this example

Run this example using:

```bash
deno run --allow-net --allow-read ./examples/content-negotiation/index.ts
```

if have the repo cloned locally _OR_

```bash
deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/content-negotiation/index.ts
```

if you don't!

Then try:

1. Opening http://localhost:3000/ in a browser - should see a HTML list.
2. `curl -X GET http://localhost:3000 -H 'Accept: text/plain'` - should see a
   plaintext list.
3. `curl -X GET http://localhost:3000 -H 'Accept: application/json'` - should
   see a JSON object.

You can also try the above on the `/users` route.
