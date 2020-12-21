import { Request } from "../types.ts";

export const requestProxy = (req: Request): Request =>
  new Proxy(req, {
    get: (target: any, name: string | number | symbol) => {
      if (name === "body") {
        return target.parsedBody ?? target.body;
      } else if (name === "raw") {
        return target.body;
      }

      return target[name];
    },
    set: (target: any, name: string | number | symbol, value: any): boolean => {
      if (name === "body") {
        target.parsedBody = value;
      } else {
        target[name] = value;
      }

      return true;
    },
  });
