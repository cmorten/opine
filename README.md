# opine

Fast, minimalist web framework for [Deno](https://deno.land/) ported from [ExpressJS](https://github.com/expressjs/express).

![Test](https://github.com/asos-craigmorten/opine/workflows/Test/badge.svg) [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/opine/mod.ts)

```ts
import opine from "https://deno.land/x/opine@master/mod.ts";

const app = opine();

app.use((req, res) => {
  res.send("Hello World");
});

app.listen({ port: 3333 });
```

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import Opine straight into your project:

```ts
import opine from "https://deno.land/x/opine@master/mod.ts";
```

> **Note:** Opine currently only supports Deno v1.0.0 due to some breaking typescript changes introduced in Deno v1.0.1 ([#5704](https://github.com/denoland/deno/issues/5704)). Fixes will be implemented soon, but in the meantime you can set the version of Deno (once installed) using the `upgrade` command:
>
> ```bash
> deno upgrade --version 1.0.0
> ```

## Features

- Robust routing
- Focus on high performance
- HTTP helpers

And more to come as we achieve feature parity with [ExpressJS](https://github.com/expressjs/express).

## Docs

- [Opine API Docs](https://github.com/asos-craigmorten/opine/blob/master/.github/API/api.md)
- [Opine Type Docs](https://asos-craigmorten.github.io/opine/)
- [Opine Deno Docs](https://doc.deno.land/https/deno.land/x/opine/mod.ts)
- [ExpressJS API Docs](https://expressjs.com/en/4x/api.html)
- [License](https://github.com/asos-craigmorten/opine/blob/master/LICENSE.md)
- [ExpressJS License](https://github.com/asos-craigmorten/opine/blob/master/EXPRESS_LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/opine/blob/master/.github/CHANGELOG.md)

## Philosophy

The Express philosophy is to provide small, robust tooling for HTTP servers, making it a great solution for single page applications, web sites, hybrids, or public HTTP APIs.

Opine will aim to achieve these same great goals, focussing first on developing robust tooling and features before moving onto accelerating performance and becoming super lightweight.

As time passes, Opine's goals may naturally diverge from [ExpressJS](https://github.com/expressjs/express) and this will be reflected here.

## Examples

To view the examples, clone the Opine repo:

```bash
git clone git://github.com/asos-craigmorten/opine.git --depth 1
cd opine
```

Then run whichever example you want:

```bash
deno --allow-net --allow-read ./example/hello-world/index.ts
```

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/opine/blob/master/.github/CONTRIBUTING.md)

## Developing

### Run Tests

```bash
make test
```

### Run Benchmarks

```bash
make benchmark
```

### Format Code

```bash
make fmt
```

### Generate Documentation

```bash
make typedoc
```
