import opine from "../mod.ts";
import {
  Application,
  NextFunction,
  OpineRequest,
  OpineResponse,
} from "../src/types.ts";

const app: Application = opine();

let middlewareCount: number = parseInt(Deno.env.get("MW") || "1");

console.log("%s middleware", middlewareCount);

while (middlewareCount--) {
  app.use(
    (_req: OpineRequest, _res: OpineResponse, next: NextFunction): void => {
      next();
    },
  );
}

app.use((_req: OpineRequest, res: OpineResponse, _next: NextFunction): void => {
  res.send("Hello World");
});

app.listen({ port: 3333 });
