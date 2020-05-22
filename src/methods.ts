// TODO: investigate whether Deno exports supported
// methods like Node's `http.METHODS`.

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
  "trace",
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
