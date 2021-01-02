import { Request } from "../types.ts";

const BODY_KEY = "body";
const PARSED_BODY_KEY = "parsedBody";
const RAW_BODY_KEY = "raw";

export const requestProxy = (req: Request): Request =>
  new Proxy(req, {
    get: (target: any, prop: string | number | symbol, receiver: any) => {
      if (prop === BODY_KEY) {
        return Reflect.get(target, PARSED_BODY_KEY, receiver) ??
          Reflect.get(target, BODY_KEY, receiver);
      } else if (prop === RAW_BODY_KEY) {
        return Reflect.get(target, BODY_KEY, receiver);
      }

      const value = Reflect.get(target, prop, receiver);
      if (prop === "respond") {
        return value.bind(target);
      }

      return value;
    },
    set: (
      target: any,
      prop: string | number | symbol,
      value: any,
      receiver: any,
    ): boolean => {
      if (prop === BODY_KEY) {
        return Reflect.set(target, PARSED_BODY_KEY, value, receiver);
      }

      return Reflect.set(target, prop, value, receiver);
    },
  });
