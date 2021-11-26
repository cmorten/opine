import { app as application } from "./application.ts";
import { WrappedRequest } from "./request.ts";
import { Response as ServerResponse } from "./response.ts";
import { mergeDescriptors } from "./utils/mergeDescriptors.ts";
import { EventEmitter } from "../deps.ts";
import type {
  NextFunction,
  Opine,
  OpineRequest,
  OpineResponse,
} from "./types.ts";

/**
 * Response prototype.
 *
 * @public
 */
export const response: OpineResponse = Object.create(ServerResponse.prototype);
export const request: OpineRequest = Object.create(WrappedRequest.prototype);

/**
 * Create an Opine application.
 *
 * @return {Opine}
 * @public
 */
export function opine(): Opine {
  const app = function (
    req: OpineRequest,
    res: OpineResponse = new ServerResponse(),
    next: NextFunction,
  ): void {
    app.handle(req, res, next);
  } as Opine;

  const eventEmitter = new EventEmitter();

  app.emit = (event: string, ...args: any[]) =>
    eventEmitter.emit(event, ...args);
  app.on = (event: string, arg: any) => eventEmitter.on(event, arg);

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
