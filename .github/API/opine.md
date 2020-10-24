# 0.x API

Adapted from the [ExpressJS API Docs](https://expressjs.com/en/4x/api.html).

## opine()

Creates an Opine application. The `opine()` function is a top-level function exported by the Opine module:

```ts
import opine from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();
```

The `opine()` function is also exported as a named export:

```ts
import { opine } from "https://deno.land/x/opine@0.25.0/mod.ts";

const app = opine();
```
