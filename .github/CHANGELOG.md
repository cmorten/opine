# ChangeLog

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
