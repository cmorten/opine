import application from "./application.ts";
import request from "./request.ts";
import Response from "./response.ts";
import Route from "./router/route.ts";
import Router from "./router/mod.ts";
import { mixin } from "./utils.ts";
import {
  Application,
  Request,
  Response as IResponse,
  NextFunction,
} from "../typings/index.d.ts";

const response: IResponse = Object.create(Response.prototype);

/**
 * Create an Opine application.
 * 
 * @return {Application}
 * @public
 */
const opine = (): Application => {
  const app: any = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => app.handle(req, res, next);

  mixin(app, application);

  app.init();

  return app;
};

export {
  opine as default,
  application,
  request,
  response,
  Route,
  Router,
};
