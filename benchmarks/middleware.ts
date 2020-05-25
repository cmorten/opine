import opine from "../mod.ts";
import {
  Application,
  Request,
  Response,
  NextFunction,
} from "../src/types.ts";

const app: Application = opine();

let middlewareCount: number = parseInt(Deno.env.get("MW") || "1");

console.log("%s middleware", middlewareCount);

while (middlewareCount--) {
  app.use((req: Request, res: Response, next: NextFunction): void => {
    next();
  });
}

app.use((req: Request, res: Response, next: NextFunction): void => {
  res.send("Hello World");
});

app.listen({ port: 3333 });
