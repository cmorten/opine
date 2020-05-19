import application from "./application.ts";
import request from "./request.ts";
import response from "./response.ts";
import Route from "./router/route.ts";
import Router from "./router/mod.ts";
import { mixin } from "./utils.ts";
import {
  Application,
  Request,
  Response,
  NextFunction,
} from "../typings/index.d.ts";

/**
 * Response prototype.
 * @public
 */
const responseProto: Response = Object.create(response.prototype);

/**
 * Create an Opine application.
 * 
 * @return {Application}
 * @public
 */
const createApplication = (): Application => {
  const app: any = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => app.handle(req, res, next);

  mixin(app, application);

  app.init();

  return app;
};

/**
 * Module exports.
 * @public
 */
export {
  createApplication as default,
  application,
  request,
  responseProto as response,
  Route,
  Router,
};
