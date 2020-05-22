# opine

Fast, minimalist web framework for [Deno](https://deno.land/) ported from [ExpressJS](https://github.com/expressjs/express).

[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/opine/mod.ts)

```ts
import opine from "https://raw.githubusercontent.com/asos-craigmorten/opine/master/mod.ts";

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

## Features

- Robust routing
- Focus on high performance
- HTTP helpers

And more to come as we achieve feature parity with [ExpressJS](https://github.com/expressjs/express).

## Docs

- [API Docs](https://asos-craigmorten.github.io/opine/) - created using [typedoc](https://typedoc.org/).
- [License](./LICENSE.md)
- [ExpressJS License](./EXPRESS_LICENSE.md)
- [Changelog](./.github/CHANGELOG.md)

## Philosophy

The Express philosophy is to provide small, robust tooling for HTTP servers, making it a great solution for single page applications, web sites, hybrids, or public HTTP APIs.

Opine will aim to achieve these same great goals, focussing first on developing robust tooling and features before moving onto accelerating performance and becoming super lightweight.

As time passes, Opine's goals may naturally diverge from ExpressJS and this will be reflected here.

## Examples

To view the examples, clone the Opine repo:

```console
git clone git://github.com/asos-craigmorten/opine.git --depth 1
cd opine
```

Then run whichever example you want:

```console
deno --allow-net --allow-read ./example/hello-world/index.ts
```

## Contributing

[Contributing guide](./.github/CONTRIBUTING.md)

## Developing

### Run Tests

```console
make test
```

### Run Benchmarks

```console
make benchmark
```

### Format Code

```console
make fmt
```

### Generate Documentation

```console
make typedoc
```
