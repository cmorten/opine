# graphql

Example of how to use Opine with [gql](https://github.com/deno-libs/gql) for a
simple GraphQL server.

## How to run this example

```sh
deno run --allow-net --allow-read ./examples/graphql/index.ts
```

if have the repo cloned locally OR

```sh
deno run --allow-net --allow-read https://raw.githubusercontent.com/cmorten/opine/main/examples/graphql/index.ts
```

if you don't!

Then try:

1. Opening a GraphQL playground on http//localhost:3000/graphql
2. Writing a query:

```graphql
{
  hello
}
```

3. You will get this:

```json
{
  "data": {
    "hello": "Hello World!"
  }
}
```
