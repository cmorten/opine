import { Request } from "../types.ts";

const BODY_KEY = "body";
const PARSED_BODY_KEY = "parsedBody";
const RAW_BODY_KEY = "raw";

export const requestProxy = (req: Request): Request =>
  new Proxy<Request>(req, {
    get: (target, prop: keyof Request) => {
      let value;

      if (prop === BODY_KEY) {
        value = target[PARSED_BODY_KEY] ?? target[BODY_KEY];
      } else if (prop === RAW_BODY_KEY) {
        value = target[BODY_KEY];
      } else {
        value = target[prop];
      }

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
