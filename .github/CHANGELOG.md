# ChangeLog

## [0.21.0] - 17-08-2020

- chore: upgrade supported Deno and std module versions to `1.3.0` and `0.65.0`.
- chore: upgrade deps with non-breaking minor / patch upgrades available.
- docs: remove references to importing by branch name.
- fix: React SSR example types after removal from deno.land/x
- [NO-ISSUE] Fixed typo in readme example (#57)
- [#50] Add app param docs (#55)
- chore: fix workflow step name

## [0.20.2] - 05-08-2020

- docs: remove reference to importing commit or branch from readme as not supported by Deno registry v2.
- fix: use fixed version of opine-http-proxy in examples.

## [0.20.1] - 04-08-2020

- chore: fix eggs link command in workflow

## [0.20.0] - 03-08-2020

- chore: upgrade supported Deno and std module versions to `1.2.2` and `0.63.0`.
- chore: fix modules to tagged versions as [commits and branches are no longer supported by Deno registry](https://deno.land/posts/registry2).
- [#21] Add app param API (#46)
- [#44] react and dejs examples not working (#47)

## [0.19.1] - 14-07-2020

- chore: formatting fix.

## [0.19.0] - 14-07-2020

- [#42] Incorrect URL argument type (#43).

## [0.18.0] - 06-07-2020

- feat: upgrade Deno to `1.1.3`, std to `0.60.0` and latest of other deps.

## [0.17.0] - 30-06-2020

- [#38] Array support for `res.append` (#23).
- fix: update lockfile for breaking sub-dependency.

## [0.16.0] - 30-06-2020

- [#22] Add res.redirect API (#36).
- docs: add React example.

## [0.15.0] - 30-06-2020

- [#34] Capture errors from async routes (#33).
- fix: examples permission instructions.
- fix: proxy example.
- [#20] Add instructions for nest.land package registry (#35).

## [0.14.0] - 29-06-2020

- fix: several minor bugfixes.
- test: add serious test coverage.
- feat: bump Deno and std versions.

## [0.13.0] - 26-06-2020

- feat: [#24] Object and array support for `res.set()` (#28).
- chore: [#29] Automate typedoc publish (#30).
- chore: [#16] Benchmark workflow name fix (#31).

## [0.12.0] - 23-06-2020

- chore: update dependencies.

## [0.11.0] - 21-06-2020

- feat: add render and engine public APIs.

## [0.10.2] - 19-06-2020

- feat: add repository field to `egg.json`.
- chore: upgrade eggs CLI in CI.

## [0.10.1] - 18-06-2020

- feat: integration with <https://nest.land> package repository.

## [0.10.0] - 16-06-2020

- feat: move to "main" branch

## [0.9.0] - 16-06-2020

- fix: lockfile dependencies.
- fix: handling of empty bodies (Content-Length: 0) within body parsers.
- chore: update support matrix to last version of v1.0.x and include v1.1.0.

## [0.8.0] - 30-05-2020

- fix: `res.sendFile()` not correctly resolving paths, impacting `res.download()` and other APIs that use it internally.
- feat: decouple the base Opine route handler from the server it starts so can use Opine as a route handler within other libraries / frameworks as middleware with a server that is not started via `app.listen()`.
- feat: attempt to close the server within `app.listen()` if an exception occurs in the server connection handling loop.

## [0.7.0] - 29-05-2020

- feat: support passing no parameters to `app.listen()` and being automatically assigned a port.

## [0.6.3] - 29-05-2020

- fix: set versions on all deps to prevent adopting breaking changes from `master`.
- feat: minor upgrade of the `std` library third party module imports to `0.53.0`.

## [0.6.2] - 29-05-2020

- feat: support express style callback on `app.listen()`.

## [0.6.1] - 29-05-2020

- refactor: Replace internal ports of NPM modules with tested third party module equivalents.

## [0.6.0] - 29-05-2020

- feat: deliver content negotiation with the `res.format()` and `res.vary()` methods.
- feat: flesh out majority of missing `request` methods and properties:
  - `req.accepts()`
  - `req.acceptsCharsets()`
  - `req.acceptsEncodings()`
  - `req.acceptsLanguages()`
  - `req.is()`
  - `req.protocol`
  - `req.secure`
  - `req.subdomains`
  - `req.path`
  - `req.hostname`
  - `req.stale`
  - `req.xhr`
- chore: update to types.
- chore: add a content negotiation example to the examples.
- chore: update the docs with the new methods / properties.

## [0.5.4] - 28-05-2020

- fix: better types for `RouterConstructor`.

## [0.5.3] - 28-05-2020

- fix: better types for `Router`.

## [0.5.2] - 28-05-2020

- fix: only set `x-powered-by` header if it is enabled as a setting.
- feat: add missing methods to `response.md` API docs: `unset` and `etag`.
- chore: audit of feature gap between Express and Opine. Available as TODOs in the code.

## [0.5.1] - 27-05-2020

- fix: missing location method type
- feat: add res.location usage example
- feat: update API docs pointer out use of res.location()

## [0.5.0] - 27-05-2020

- fix: major bug with the body parsers. `req.body` is protected in Deno and thus cannot overwrite. We _could_ look to use a proxy like method in the future. For now we populate `req.parsedBody` instead.
- docs: update middlewares and request docs to cover the use of `req.parsedBody`.
- test: update body-parser unit tests.
- docs: update examples to include `urlencoded`, `text` and `raw` body parser examples.
- docs: add `README.md` to the examples + improve each examples' `README.md`.

## [0.4.2] - 26-05-2020

- fix: formatting bug.

## [0.4.1] - 26-05-2020

- feat: allow Express-like `port` passing signature for `app.listen()`.

## [0.4.0] - 25-05-2020

- feat: initial serveStatic implementation
- refactor: clean up examples.
- refactor: remove superfluous verification code given we have static type checking.
- refactor: remove unnecessary file path parsing.
- chore: remove old typings folder.
- chore: update docs, lockfile etc.
- feat: add benchmarks github action
- feat: update API docs with `serveStatic` middleware section

## [0.3.0] - 25-05-2020

- `evt@1.6.8` -> `evt@1.7.9` to pull in bug fixes for Deno `>=1.0.2`.
- Moved from `DENO_SUPPORTED_VERSION` to `DENO_SUPPORTED_VERSIONS`
- Added support for `v1.0.2` to CI workflow (`v1.0.1` not supported due to breaking error in Deno).

## [0.2.0] - 23-05-2020

- `json`, `text`, `raw` and `urlencoded` body parser middlewares.

## [0.1.0] - 23-05-2020

- Test coverage for majority of code that doesn't require supertest.
- fix: bug in router when next is undefined
- fix: bug in url parser for FQDN and other combinations
- fix: bug in etag generator not decoding Uint8Arrays

## [0.0.4] - 22-05-2020

- Etags and fresh checking.
- `request.get()` and `request.fresh`.
- Types overhaul.
- Large refactor of import / export strategy.
- Bug fixes.

## [0.0.3] - 21-05-2020

- Export query middleware
- Convert finalHandler to ts file.
- Some additional properties of Response type.

## [0.0.2] - 20-05-2020

- Ported hello world, download, error and multi-router examples from Express.
- Event emitter added to application.
- Use same pathToRegex version as Express (copied locally as can't be imported).
- Fix filepath in `res.sendFile`.
- Fix the mounting of routers onto the app (at the cost of performance - to be remedied).
- `Request` type.
- Improvements to the final handler.

## [0.0.1] - 19-05-2020

- Initial port of ExpressJS to Deno.
