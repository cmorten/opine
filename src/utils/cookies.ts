import type { Cookie } from "../../deps.ts";

/**
 * Returns `true` if the input has type `{ name: string }`. 
 * @param value
 * @see https://doc.deno.land/https/deno.land/std/http/mod.ts#Cookie
 */
export function hasCookieNameProperty(
  value: any,
): value is Pick<Cookie, "name"> {
  return value && typeof value === "object" && typeof value.name === "string";
}

/**
 * Returns `true` if input has all required properties of `Cookie`.
 * @param value 
 * @see https://doc.deno.land/https/deno.land/std/http/mod.ts#Cookie
 */
export function hasCookieRequiredProperties(
  value: any,
): value is Pick<Cookie, "name" | "value"> {
  return hasCookieNameProperty(value) &&
    typeof (value as any).value === "string";
}
