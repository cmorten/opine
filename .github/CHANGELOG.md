# ChangeLog

## [0.3.0] - 25-05-2020

### Updated

- `evt@1.6.8` -> `evt@1.7.9` to pull in bug fixes for Deno `>=1.0.1`.
- Moved from `DENO_SUPPORTED_VERSION` to `DENO_SUPPORTED_VERSIONS`
- Added `v1.0.1` and `v1.0.2` to CI workflow.

## [0.2.0] - 23-05-2020

### Added

- `json`, `text`, `raw` and `urlencoded` body parser middlewares.

## [0.1.0] - 23-05-2020

### Added

- Test coverage for majority of code that doesn't require supertest.

### Updated

- fix: bug in router when next is undefined
- fix: bug in url parser for FQDN and other combinations
- fix: bug in etag generator not decoding Uint8Arrays

## [0.0.4] - 22-05-2020

### Added

- Etags and fresh checking.
- `request.get()` and `request.fresh`.

### Updated

- Types overhaul.
- Large refactor of import / export strategy.
- Bug fixes.

## [0.0.3] - 21-05-2020

### Added

- Export query middleware

### Updated

- Convert finalHandler to ts file.
- Some additional properties of Response type.

## [0.0.2] - 20-05-2020

### Added

- Ported hello world, download, error and multi-router examples from Express.
- Event emitter added to application.

### Updated

- Use same pathToRegex version as Express (copied locally as can't be imported).
- Fix filepath in `res.sendFile`.
- Fix the mounting of routers onto the app (at the cost of performance - to be remedied).
- `Request` type.
- Improvements to the final handler.

## [0.0.1] - 19-05-2020

### Added

- Initial port of ExpressJS to Deno.
