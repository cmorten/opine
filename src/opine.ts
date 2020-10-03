import { app as application } from "./application.ts";
import { request } from "./request.ts";
import { Response as ServerResponse } from "./response.ts";
import { mergeDescriptors } from "./utils/mergeDescriptors.ts";
import { EventEmitter, getEvent } from "../deps.ts";
import type { NextFunction, Opine, Request, Response } from "./types.ts";

/**
 * Response prototype.
 * 
 * @public
 */
export const response: Response = Object.create(ServerResponse.prototype);

/**
 * Create an Opine application.
 * 
 * @return {Opine}
 * @public
 */
export function opine(): Opine {
  const app = ((
    req: Request,
    res: Response = new ServerResponse(),
    next: NextFunction,
  ): void => {
    app.handle(req, res, next);
  }) as Opine;

  const eventEmitter = EventEmitter.create<[string, any]>();

  app.emit = (event: string, arg: any) => eventEmitter.post([event, arg]);
  app.on = (event: string, arg: any) =>
    eventEmitter.$attach(getEvent(event), arg);

  mergeDescriptors(app, application, false);

  // expose the prototype that will get set on requests
  app.request = Object.create(request, {
    app: { configurable: true, enumerable: true, writable: true, value: app },
  });

  // expose the prototype that will get set on responses
  app.response = Object.create(response, {
    app: { configurable: true, enumerable: true, writable: true, value: app },
  });

  app.init();

  return app;
}
