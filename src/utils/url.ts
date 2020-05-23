import { Request, ParsedURL } from "../types.ts";

const fillInProtocol = "http://";
const fillInProtohost = "deno.land";

/**
 * Extracts the url from a Deno request object and
 * returns a URL object with memoization.
 * 
 * As a side-effect, the URL object is stored on the
 * request object under `_parsedUrl`.
 * 
 * @param {Request} req
 * @returns {ParsedURL}
 * @public 
 */
export const parseUrl = (req: Request): ParsedURL => {
  const url = req.url;
  const parsedUrl = req._parsedUrl;

  if (parsedUrl && parsedUrl._raw === url) {
    return parsedUrl;
  }

  // Start with attempting to parse the `url` itself.
  try {
    req._parsedUrl = new URL(url) as any;
  } catch (_) {
    // Attempt to parse non-FQDN url.

    req.headers = req.headers || new Headers();
    const host = req.headers.get("host");
    const protocol = req.proto
      ? `${req.proto.split("/")[0].toLowerCase()}://`
      : "";

    // TODO: Currently lacking a good `url.parse` method
    req._url = `${protocol || fillInProtocol}${host || fillInProtohost}${url}`;

    let newParsedUrl: URL = {} as any;
    try {
      newParsedUrl = new URL(req._url) as any;
    } catch (_) {}

    req._parsedUrl = {
      protocol: protocol ? newParsedUrl.protocol : null,
      hostname: host ? newParsedUrl.hostname : null,
      host: host ? newParsedUrl.host : null,
      href: host ? newParsedUrl.href : null,
      origin: host ? newParsedUrl.origin : null,
      port: host ? newParsedUrl.port : null,
      hash: newParsedUrl.hash || null,
      search: newParsedUrl.search || null,
      searchParams: newParsedUrl.searchParams || null,
      pathname: url ? newParsedUrl.pathname || url || null : null,
      password: newParsedUrl.password || null,
      username: newParsedUrl.username || null,
    } as any;
  }

  (req._parsedUrl as any)._raw = url;

  return req._parsedUrl as ParsedURL;
};
