import { compile } from "./proxyAddr.ts";

type TrustValue = Function | boolean | string | number | string[];

/**
 * Compile "proxy trust" value to function.
 *
 * @param  {Boolean|String|Number|Array|Function} value
 * @return {Function}
 * @private
 */
export function compileTrust(value: TrustValue) {
  if (typeof value === "function") return value;

  if (value === true) {
    // Support plain true / false
    return function () {
      return true;
    };
  }

  if (typeof value === "number") {
    // Support trusting hop count
    return function (_: unknown, i: number) {
      return i < value;
    };
  }

  if (typeof value === "string") {
    // Support comma-separated values
    value = value.split(/ *, */);
  }

  return compile(value || []);
}
