# ChangeLog

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
