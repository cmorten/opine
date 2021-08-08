<p align="center">
  <a href="https://www.linkedin.com/in/hannah-morten-b1218017a/"><img height="200" style="height:200px;" src="https://github.com/asos-craigmorten/opine/raw/main/.github/icon.png" alt="Deno reading an opinionated book"></a>
  <h1 align="center">Opine</h1>
</p>
<p align="center">
Fast, minimalist web framework for <a href="https://deno.land/">Deno</a> ported from <a href="https://github.com/expressjs/express">ExpressJS</a>.</p>
<p align="center">
   <a href="https://github.com/asos-craigmorten/opine/tags/"><img src="https://img.shields.io/github/tag/asos-craigmorten/opine" alt="Current version" /></a>
   <img src="https://github.com/asos-craigmorten/opine/workflows/Test/badge.svg" alt="Current test status" />
   <a href="https://doc.deno.land/https/deno.land/x/opine/mod.ts"><img src="https://doc.deno.land/badge.svg" alt="Deno docs" /></a>
   <a href="http://makeapullrequest.com"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs are welcome" /></a>
   <a href="https://github.com/asos-craigmorten/opine/issues/"><img src="https://img.shields.io/github/issues/asos-craigmorten/opine" alt="Opine issues" /></a>
   <img src="https://img.shields.io/github/stars/asos-craigmorten/opine" alt="Opine stars" />
   <img src="https://img.shields.io/github/forks/asos-craigmorten/opine" alt="Opine forks" />
   <img src="https://img.shields.io/github/license/asos-craigmorten/opine" alt="Opine license" />
   <a href="https://GitHub.com/asos-craigmorten/opine/graphs/commit-activity"><img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Opine is maintained" /></a>
   <a href="https://nest.land/package/opine"><img src="https://nest.land/badge.svg" alt="Published on nest.land" /></a>
</p>
<p align="center">
   <a href="https://deno.land/x/opine"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Flatest-version%2Fx%2Fopine%2Fmod.ts" alt="Opine latest /x/ version" /></a>
   <a href="https://github.com/denoland/deno/blob/main/Releases.md"><img src="https://img.shields.io/badge/deno-1.12.2-brightgreen?logo=deno" alt="Minimum supported Deno version" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/opine/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fdep-count%2Fx%2Fopine%2Fmod.ts" alt="Opine dependency count" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/opine/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fupdates%2Fx%2Fopine%2Fmod.ts" alt="Opine dependency outdatedness" /></a>
   <a href="https://deno-visualizer.danopia.net/dependencies-of/https/deno.land/x/opine/mod.ts"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fdeno-visualizer.danopia.net%2Fshields%2Fcache-size%2Fx%2Fopine%2Fmod.ts" alt="Opine cached size" /></a>
</p>

---

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Features](#features)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Philosophy](#philosophy)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Getting Started

```ts
import { opine } from "https://deno.land/x/opine@1.7.1/mod.ts";

const app = opine();

app.get("/", function(req, res) {
  res.send("Hello World");
});

app.listen(3000, () => console.log("server has started on http://localhost:3000 🚀"));
```

## Installation

This is a [Deno](https://deno.land/) module available to import direct from this repo and via the [Deno Registry](https://deno.land/x).

Before importing, [download and install Deno](https://deno.land/#installation).

You can then import Opine straight into your project:

```ts
import { opine } from "https://deno.land/x/opine@1.7.1/mod.ts";
```

Opine is also available on [nest.land](https://nest.land/package/opine), a package registry for Deno on the Blockchain.

```ts
import { opine } from "https://x.nest.land/opine@1.7.1/mod.ts";
```

## Features

- Robust routing
- Focus on high performance
- Large selection of HTTP helpers including support for downloading / sending files, etags, Content-Disposition, cookies, JSONP etc.
- Support for static serving of assets
- View system supporting template engines
- Content negotiation
- Compatible with [SuperDeno](https://github.com/asos-craigmorten/superdeno) for easy server testing
- Supports HTTP proxy middleware with [opine-http-proxy](https://github.com/asos-craigmorten/opine-http-proxy)

## Documentation

- [Opine Docs](https://github.com/asos-craigmorten/opine/blob/main/.github/API/api.md) - usually the best place when getting started ✨
- [Opine Type Docs](https://asos-craigmorten.github.io/opine/)
- [Opine Deno Docs](https://doc.deno.land/https/deno.land/x/opine/mod.ts)
- [ExpressJS API Docs](https://expressjs.com/en/4x/api.html)
- [License](https://github.com/asos-craigmorten/opine/blob/main/LICENSE.md)
- [ExpressJS License](https://github.com/asos-craigmorten/opine/blob/main/EXPRESS_LICENSE.md)
- [Changelog](https://github.com/asos-craigmorten/opine/blob/main/.github/CHANGELOG.md)

## Quick Start

The quickest way to get started with Opine is to utilize the [Opine CLI](https://github.com/cmorten/opine-cli) to generate an application as shown below:

Install the executable. The executable's major version will match Opine's:

```bash
deno install -f -q --allow-read --allow-write --allow-net --unstable https://deno.land/x/opinecli@1.2.0/opine-cli.ts
```

And follow any suggestions to update your `PATH` environment variable.

Create the app:

```bash
opine-cli --view=ejs hello-deno && cd hello-deno
```

Start your Opine app at `http://localhost:3000/`:

```bash
deno run --allow-net --allow-read --allow-env mod.ts
```

## Philosophy

The Express philosophy is to provide small, robust tooling for HTTP servers, making it a great solution for single page applications, web sites, hybrids, or public HTTP APIs.

Opine will aim to achieve these same great goals, focussing first on developing robust tooling and features before moving onto accelerating performance and becoming super lightweight.

As time passes, Opine's goals may naturally diverge from [ExpressJS](https://github.com/expressjs/express) and this will be reflected here.

## Examples

To run the [examples](./examples), you have two choices:

1. Run the example using Deno directly from GitHub, for example:

   ```bash
   deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/hello-world/index.ts
   ```

1. Clone the Opine repo locally:

   ```bash
   git clone git://github.com/asos-craigmorten/opine.git --depth 1
   cd opine
   ```

   Then run the example you want:

   ```bash
   deno run --allow-net --allow-read ./examples/hello-world/index.ts
   ```

All the [examples](./examples) contain example commands in their READMEs to help get you started for either of the above methods.

## Contributing

[Contributing guide](https://github.com/asos-craigmorten/opine/blob/main/.github/CONTRIBUTING.md)

---

## License

There are several third party modules that have been ported into this module. Each third party module has maintained it's license and copyrights. The only exception is for Express, from which this entire module has been ported, whose license and copyrights are available at [EXPRESS_LICENSE](./EXPRESS_LICENSE.md) in the root of this repository, and cover all files within the [source](./src) directory which not been explicitly licensed otherwise.

All modules adapted into this module are licensed under the MIT License.

Opine is licensed under the [MIT License](./LICENSE.md).

Icon designed and created by [Hannah Morten](https://www.linkedin.com/in/hannah-morten-b1218017a/).
