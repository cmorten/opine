/**
 * Run this example using:
 *
 *    deno run --allow-net --allow-read ./examples/graphql/index.ts
 *
 *    if have the repo cloned locally OR
 *
 *    deno run --allow-net --allow-read https://raw.githubusercontent.com/asos-craigmorten/opine/main/examples/graphql/index.ts
 *
 *    if you don't!
 *
 */

import { opine } from "../../mod.ts";
import { GraphQLHTTP } from "https://deno.land/x/gql@0.1.4/mod.ts";
import { makeExecutableSchema } from "https://deno.land/x/graphql_tools@0.0.1/mod.ts";
import { gql } from "https://deno.land/x/graphql_tag@0.0.1/mod.ts";

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => `Hello World!`,
  },
};

const schema = makeExecutableSchema({ resolvers, typeDefs });

const app = opine();

app.use("/graphql", GraphQLHTTP({ schema, graphiql: true }));

if (import.meta.main) {
  app.listen(3000);
  console.log("Opine started on port 3000");
}

export { app };
