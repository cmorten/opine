import { ServerRequest } from "../deps.ts";

/**
 * Request prototype.
 * @public
 */
const Request: ServerRequest = Object.create(ServerRequest.prototype);

/**
 * Module exports.
 * @public
 */
export default Request;
