import opine from "../mod.ts";
import {
  Application,
  Request,
  Response,
  NextFunction,
} from "../typings/index.d.ts";

const app: Application = opine();

let middlewareCount: number = parseInt(Deno.env.get("MW") || "1");

console.log("%s middleware", middlewareCount);

while (middlewareCount--) {
  app.use((_req: Request, _res: Response, next: NextFunction): void => {
    next();
  });
}

app.use((_req: Request, res: Response, _next: NextFunction): void => {
  res.send("Hello World");
});

app.listen({ port: 3333 });
