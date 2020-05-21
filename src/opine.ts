import application from "./application.ts";
import req from "./request.ts";
import response from "./response.ts";
import Route from "./router/route.ts";
import Router from "./router/index.ts";
import { mixin } from "./utils.ts";
import { EventEmitter, getEvent } from "../deps.ts";
import {
  Application,
  Request,
  Response,
  NextFunction,
} from "../typings/index.d.ts";

const res: Response = Object.create(response.prototype);

/**
 * Create an Opine application.
 * 
 * @return {Application}
 * @public
 */
function opine(): Application {
  const app: any = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): void => {
    app.handle(req, res, next);
  };

  const eventEmitter = EventEmitter.create<[string, any]>();

  app.emit = (event: string, arg: any) => eventEmitter.post([event, arg]);
  app.on = (event: string, arg: any) =>
    eventEmitter.$attach(getEvent(event), arg);

  mixin(app, application);

  app.request = Object.create(req, {
    app: { configurable: true, enumerable: true, writable: true, value: app },
  });

  app.response = Object.create(res, {
    app: { configurable: true, enumerable: true, writable: true, value: app },
  });

  app.init();

  return app;
}

export default opine;

export {
  application,
  req as request,
  res as response,
  Route,
  Router,
};

export { default as query } from "./middleware/query.ts";
