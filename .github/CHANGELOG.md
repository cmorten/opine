# ChangeLog

## [2.1.3] - 12-03-2022

- deps: support Deno `1.19.3`, std `0.129.0`, and other minor dep upgrades.
- [#162] remove usage of `Deno.Buffer`

## [2.1.2] - 20-02-2022

- [#156] Replace deprecated Deno.readAll (#157) @yourfriendoss
- deps: support Deno `1.19.0`, std `0.126.0`, and other minor dep upgrades.

## [2.1.1] - 11-01-2022

- fix: remove unnecessary argument to `req.upgrade()`

## [2.1.0] - 11-01-2022

- [#154] Implement WebSocket support. (#155) @xyzshantaram
- deps: support Deno `1.17.2`, std `0.120.0`, and other minor dep upgrades.

## [2.0.2] - 01-01-2022

- [#145] [#151] don't close file before fully read to stream

## [2.0.1] - 18-12-2021

- deps: support Deno `1.17.1`, std `0.119.0`, and other minor dep upgrades.

## [2.0.0] - 28-11-2021

- feat: support Deno `1.16.3`, std `0.116.0`, and other minor dep upgrades.
- feat: adopt `std/http/server.ts` native server.

## [1.9.1] - 14-11-2021

- feat: support Deno `1.16.1`, std `0.114.0`, and other minor dep upgrades.
- [#147] bring `createError()` method into Opine due to outdated dependencies in
  unmaintained upstream module.

## [1.9.0] - 29-10-2021

- feat: support Deno `1.15.3`, std `0.113.0`, and other minor dep upgrades.

## [1.8.0] - 21-09-2021

- [#143] upgrade to support deno v1.14.0 (#142)

## [1.7.2] - 17-08-2021

- feat: support Deno `1.13.1` and std `0.105.0`.

## [1.7.1] - 08-08-2021

- [#137] Move to skypack for npm deps (#138)
- docs: fix broken middleware links in request docs (#136)

## [1.7.0] - 01-08-2021

- [#102] Handle broken pipe errors gracefully in opine (#135)
- feat: support Deno `1.12.2` and std `0.103.0`.

## [1.6.0] - 13-07-2021

- [#132] std lib and deno upgrade (#133)
- feat: support Deno `1.12.0` and std `0.101.0`.

## [1.5.4] - 03-07-2021

- test: upgrade superdeno version.
- feat: upgrade std `0.100.0`.
- ci: downgrade support to Deno `1.11.1` due to bug with `OPTIONS` requests
  introduced in `1.11.2`. REF: https://github.com/denoland/deno/issues/10990.
- chore: upgrade examples dependencies to latest versions.

## [1.5.3] - 19-06-2021

- fix: version typo

## [1.5.2] - 19-06-2021

- ci: bump eggs CLI to `0.3.8`

## [1.5.1] - 19-06-2021

- ci: bump eggs CLI to `0.3.7`

## [1.5.0] - 19-06-2021

- [NO-ISSUE] Support Deno 1.11.1 and std 0.99.0 (#131)
- [#128] add res.removeHeader (#129)
- [#126] add setHeader alias for res.set (#127)

## [1.4.0] - 22-05-2021

- feat: support Deno `1.10.2` and std `0.97.0`
- chore: some lint fixes

## [1.3.4] - 06-05-2021

- ci: upgrade eggs CLI to `0.3.6` and drop checks from workflow.

## [1.3.3] - 26-04-2021

- feat: support Deno `1.9.2` and std `0.95.0`

## [1.3.2] - 14-04-2021

- fix: format lockfile to prevent Eggs CLI failure.

## [1.3.1] - 14-04-2021

- ci: downgrade eggs publish to Deno `1.8.3` due to bug in Eggs CLI.

## [1.3.0] - 14-04-2021

- feat: support Deno `1.9.0` and std `0.93.0`
- Add GraphQL example (#109)

## [1.2.0] - 06-03-2021

- docs: add new deno vis badges
- docs: simplify contributing
- [#105] Updates react example for deno 1.7.5 (#106)
- feat: Support Deno `1.8.0` and std `0.89.0`
- chore: upgrade dependencies, replace evt dep with std library EventEmitter

## [1.1.0] - 17-01-2021

- refactor: replace `denoflate` library with `compress` library to remove net
  requirement as a result of wasm usage.
- chore: upgrade to official denoland vscode plugin.

## [1.0.2] - 02-01-2021

- feat: Support Deno `1.6.3` and std `0.83.0`

## [1.0.1] - 29-12-2020

- [#97] Support `--no-check` flag (#99)
- feat: Support Deno `1.6.2` and std `0.82.0`
- ci: Fix typedoc to version `0.19.2`

## [1.0.0] - 21-12-2020

- [#26] Implement request body proxy (#95)

**Breaking**: `req.body` will now be overwritten by body parsers. To retrieve
the original body value, use `req.raw`.

## [0.28.0] - 21-12-2020

- [#75] File options support (#85)

## [0.27.1] - 20-12-2020

- feat: upgrade Opine to support Deno 1.6.1 and std 0.81.0
- feat: upgrade superdeno to 3.0.0
- ci: upgrade eggs cli to 0.3.3

## [0.27.0] - 09-12-2020

- feat: upgrade Opine to support Deno 1.6.0 and std 0.80.0
- feat: upgrade superdeno and evt modules

## [0.26.0] - 01-12-2020

- feat: upgrade Opine to support Deno 1.5.4 and std 0.79.0

## [0.25.0] - 24-10-2020

- [#72] Implement trust proxy setting (#84)

## [0.24.0] - 17-10-2020

- [#52] Support gzip and deflate content-encoding (#81)
- [#56] Add cors example (#82)
- [#25] Implement MVC example (#83)

## [0.23.1] - 03-10-2020

- revert(ci): downgrade to eggs@0.2.2 in CI

## [0.23.0] - 03-10-2020

- [#73] Implement req.range() API (#78)
- [#71] Query parser setting support (#79)
- [#74] res.cookie & res.clearCookie express style overloads (#80)
- feat(deps): upgrade to Deno 1.4.4, std 0.73.0 and few other dep upgrades
- chore(ci): upgrade to eggs@0.2.3 in CI

## [0.22.2] - 19-09-2020

- chore: upgrade to eggs@0.2.2 in CI

## [0.22.1] - 19-09-2020

- feat: upgrade Opine to support Deno 1.4.1 and std 0.70.0

## [0.22.0] - 17-09-2020

- [#69] Upgrade Opine to support Deno 1.4.0 and std 0.69.0 (#70)

## [0.21.6] - 15-09-2020

- (fix) deno 1.4.0 : export type (#67)

## [0.21.5] - 12-09-2020

- [#61] Add an example of using the Eta template engine (#65)
- chore: upgrade supported Deno and std module versions to `1.3.3` and `0.68.0`

## [0.21.4] - 08-09-2020

- [#62] Remove scripts to run examples remotely where invalid (#63)

## [0.21.3] - 24-08-2020

- chore: upgrade supported Deno and std module versions to `1.3.1` and `0.66.0`.
- chore: upgrade superdeno for Deno 1.3.1 bugfix.
- test: null responses are now exposed as null in superdeno (not empty strings).

## [0.21.2] - 18-08-2020

- [#58] Broken redirect directory listener (#60)

## [0.21.1] - 18-08-2020

- [#58] Windows serveStatic file path handling fix (#59)

## [0.21.0] - 17-08-2020

- chore: upgrade supported Deno and std module versions to `1.3.0` and `0.65.0`.
- chore: upgrade deps with non-breaking minor / patch upgrades available.
- docs: remove references to importing by branch name.
- fix: React SSR example types after removal from deno.land/x
- [NO-ISSUE] Fixed typo in readme example (#57)
- [#50] Add app param docs (#55)
- chore: fix workflow step name

## [0.20.2] - 05-08-2020

- docs: remove reference to importing commit or branch from readme as not
  supported by Deno registry v2.
- fix: use fixed version of opine-http-proxy in examples.

## [0.20.1] - 04-08-2020

- chore: fix eggs link command in workflow

## [0.20.0] - 03-08-2020

- chore: upgrade supported Deno and std module versions to `1.2.2` and `0.63.0`.
- chore: fix modules to tagged versions as
  [commits and branches are no longer supported by Deno registry](https://deno.land/posts/registry2).
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

## [0.14.0] - 29-06-2020

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

- fix: `res.sendFile()` not correctly resolving paths, impacting
  `res.download()` and other APIs that use it internally.
- feat: decouple the base Opine route handler from the server it starts so can
  use Opine as a route handler within other libraries / frameworks as middleware
  with a server that is not started via `app.listen()`.
- feat: attempt to close the server within `app.listen()` if an exception occurs
  in the server connection handling loop.

## [0.7.0] - 29-05-2020

- feat: support passing no parameters to `app.listen()` and being automatically
  assigned a port.

## [0.6.3] - 29-05-2020

- fix: set versions on all deps to prevent adopting breaking changes from
  `master`.
- feat: minor upgrade of the `std` library third party module imports to
  `0.53.0`.

## [0.6.2] - 29-05-2020

- feat: support express style callback on `app.listen()`.

## [0.6.1] - 29-05-2020

- refactor: Replace internal ports of NPM modules with tested third party module
  equivalents.

## [0.6.0] - 29-05-2020

- feat: deliver content negotiation with the `res.format()` and `res.vary()`
  methods.
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
- chore: audit of feature gap between Express and Opine. Available as TODOs in
  the code.

## [0.5.1] - 27-05-2020

- fix: missing location method type
- feat: add res.location usage example
- feat: update API docs pointer out use of res.location()

## [0.5.0] - 27-05-2020

- fix: major bug with the body parsers. `req.body` is protected in Deno and thus
  cannot overwrite. We _could_ look to use a proxy like method in the future.
  For now we populate `req.parsedBody` instead.
- docs: update middlewares and request docs to cover the use of
  `req.parsedBody`.
- test: update body-parser unit tests.
- docs: update examples to include `urlencoded`, `text` and `raw` body parser
  examples.
- docs: add `README.md` to the examples + improve each examples' `README.md`.

## [0.4.2] - 26-05-2020

- fix: formatting bug.

## [0.4.1] - 26-05-2020

- feat: allow Express-like `port` passing signature for `app.listen()`.

## [0.4.0] - 25-05-2020

- feat: initial serveStatic implementation
- refactor: clean up examples.
- refactor: remove superfluous verification code given we have static type
  checking.
- refactor: remove unnecessary file path parsing.
- chore: remove old typings folder.
- chore: update docs, lockfile etc.
- feat: add benchmarks github action
- feat: update API docs with `serveStatic` middleware section

## [0.3.0] - 25-05-2020

- `evt@1.6.8` -> `evt@1.7.9` to pull in bug fixes for Deno `>=1.0.2`.
- Moved from `DENO_SUPPORTED_VERSION` to `DENO_SUPPORTED_VERSIONS`
- Added support for `v1.0.2` to CI workflow (`v1.0.1` not supported due to
  breaking error in Deno).

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
- Fix the mounting of routers onto the app (at the cost of performance - to be
  remedied).
- `Request` type.
- Improvements to the final handler.

## [0.0.1] - 19-05-2020

- Initial port of ExpressJS to Deno.
