/**
 * Supported Deno methods.
 *
 * @public
 */
export const methods: string[] = [
  "get",
  "post",
  "put",
  "head",
  "delete",
  "options",
  // "trace", // As of Deno 1.9.0 - TypeError: Method is forbidden.
  "copy",
  "lock",
  "mkcol",
  "move",
  "purge",
  "propfind",
  "proppatch",
  "unlock",
  "report",
  "mkactivity",
  "checkout",
  "merge",
  "m-search",
  "notify",
  "subscribe",
  "unsubscribe",
  "patch",
  "search",
  "connect",
];
