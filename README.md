# opine

An opinionated server for Deno ported from ExpressJS.

- [API Docs](https://asos-craigmorten.github.io/opine/) - created using [typedoc](https://typedoc.org/).
- [Contributing Docs](./.github/CONTRIBUTING.md)
- [Changelog](./.github/CHANGELOG.md)
- [License](./LICENSE.md)
- [ExpressJS License](./EXPRESS_LICENSE.md)

## Example

```ts
import opine from "https://raw.githubusercontent.com/asos-craigmorten/opine/master/mod.ts";
import {
  Application,
  Request,
  Response,
  NextFunction,
} from "https://raw.githubusercontent.com/asos-craigmorten/opine/master/typings/index.d.ts";

const app: Application = opine();

app.use((_req: Request, res: Response, _next: NextFunction): void => {
  res.send("Hello World");
});

app.listen({ port: 3333 });
```

Run this example now using Deno the [opine-demo.ts](https://gist.github.com/asos-craigmorten/944d0d14130ac5d1f297829010836a73) gist.

```console
deno run --allow-net https://gist.githubusercontent.com/asos-craigmorten/944d0d14130ac5d1f297829010836a73/raw/2b755366ae37a0a6e255d43ec1d1d6401e9cf47c/opine-demo.ts
```

And open the browser at <http://localhost:3333/>.

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
make doc
```
