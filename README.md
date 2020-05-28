# opine

Fast, minimalist web framework for [Deno](https://deno.land/) ported from [ExpressJS](https://github.com/expressjs/express).

![Test](https://github.com/asos-craigmorten/opine/workflows/Test/badge.svg) [![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/opine/mod.ts) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com) [![](https://img.shields.io/github/issues/asos-craigmorten/opine)](https://img.shields.io/github/issues/asos-craigmorten/opine)
![](https://img.shields.io/github/stars/asos-craigmorten/opine) ![](https://img.shields.io/github/forks/asos-craigmorten/opine) ![](https://img.shields.io/github/license/asos-craigmorten/opine) [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/asos-craigmorten/opine/graphs/commit-activity) [![HitCount](http://hits.dwyl.com/asos-craigmorten/opine.svg)](http://hits.dwyl.com/asos-craigmorten/opine)

```ts
import opine from "https://deno.land/x/opine@master/mod.ts";

const app = opine();

app.use((req, res) => {
  res.send("Hello World");
});

app.listen(3000);
```

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

> Please refer to the [version file](./version.ts) for a list of Deno versions supported by Opine.
>
> Once Deno is installed, you can easily switch between Deno versions using the `upgrade` command:
>
> ```bash
> # Upgrade to latest version:
> deno upgrade
>
> # Upgrade to a specific version, replace `<version>` with the version you want (e.g. `1.0.0`):
> deno upgrade --version <version>
> ```

You can then import Opine straight into your project:

```ts
import opine from "https://deno.land/x/opine@master/mod.ts";
```

If you want to use a specific version of Opine, just modify the import url to contain the version:

```ts
import opine from "https://deno.land/x/opine@0.3.0/mod.ts";
```

Or if you want to use a specific commit of Opine, just modify the import url to contain the commit hash:

```ts
import opine from "https://deno.land/x/opine@c21f8d6/mod.ts";
```

## Features

- Robust routing
- Focus on high performance
- HTTP helpers

And more to come as we achieve feature parity with [ExpressJS](https://github.com/expressjs/express).

## Docs

- [Opine Docs](https://github.com/asos-craigmorten/opine/blob/master/.github/API/api.md) - usually the best place when getting started ✨
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

To run the [examples](./examples), you have two choices:

1. Run the example using Deno directly from GitHub, for example:

   ```bash
   deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/master/examples/hello-world/index.ts
   ```

1. Clone the Opine repo locally:

   ```bash
   git clone git://github.com/asos-craigmorten/opine.git --depth 1
   cd opine
   ```

   Then run the example you want:

   ```bash
   deno --allow-net --allow-read ./example/hello-world/index.ts
   ```

All the [examples](./examples) contain example commands in their READMEs to help get you started for either of the above methods.

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/opine/blob/master/.github/CONTRIBUTING.md)

---

## License

There are several third party modules that have been ported into this module. Each third party module has maintained it's license and copyrights. The only exception is for Express, from which this entire module has been ported, whose license and copyrights are available at [EXPRESS_LICENSE](./EXPRESS_LICENSE.md) in the root of this repository, and cover all files within the [source](./src) directory which not been explicitly licensed otherwise.

All modules adapted into this module are licensed under the MIT License.

Opine is licensed under the [MIT License](./LICENSE.md).
