# react

An example of how you can use Opine with React.

This example uses ejs templates to create the HTML markup, serves static assets for styles, and performs server-side rendering of the React application. The application itself makes use of experimental Suspense for data-fetching which demonstrates "render-as-you-fetch", retrieving data from an API the server hosts.

## How to run this example

Run this example using:

```bash
deno run --allow-net --allow-read --unstable ./examples/react/server.tsx
```

if have the repo cloned locally.

Unfortunately template rendering is not currently supported for remote URLs so this cannot be run from the repo.
