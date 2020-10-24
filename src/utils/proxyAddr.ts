/**
 * Port of proxy-addr (https://github.com/pillarjs/proxy-addr/tree/v2.0.6) for Deno.
 * 
 * Licensed as follows:
 * 
 * The MIT License
 * 
 * Copyright (c) 2014-2016 Douglas Christopher Wilson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 */

import { ipaddr } from "../../deps.ts";
import { forwarded } from "./forwarded.ts";
import type { ServerRequest } from "../../deps.ts";

const DIGIT_REGEXP = /^[0-9]+$/;
const isip = ipaddr.isValid;
const parseip = ipaddr.parse;

/**
 * Pre-defined IP ranges.
 * @private
 */

const IP_RANGES: { [key: string]: string[] } = {
  linklocal: ["169.254.0.0/16", "fe80::/10"],
  loopback: ["127.0.0.1/8", "::1/128"],
  uniquelocal: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "fc00::/7"],
};

/**
 * Get all addresses in the request, optionally stopping
 * at the first untrusted.
 *
 * @param {Object} request
 * @param {Function|Array|String} [trust]
 * @public
 */
export function all(req: ServerRequest, trust: Function | string[] | string) {
  // get addresses
  const addrs = forwarded(req);

  if (!trust) {
    // Return all addresses
    return addrs;
  }

  if (typeof trust !== "function") {
    trust = compile(trust);
  }

  for (var i = 0; i < addrs.length - 1; i++) {
    if (trust(addrs[i], i)) continue;

    addrs.length = i + 1;
  }

  return addrs;
}

/**
 * Compile argument into trust function.
 *
 * @param {Array|String} value
 * @private
 */
export function compile(value: string[] | string) {
  if (!value) {
    throw new TypeError("argument is required");
  }

  let trust;

  if (typeof value === "string") {
    trust = [value];
  } else if (Array.isArray(value)) {
    trust = value.slice();
  } else {
    throw new TypeError("unsupported trust argument");
  }

  for (var i = 0; i < trust.length; i++) {
    value = trust[i];

    if (!Object.prototype.hasOwnProperty.call(IP_RANGES, value)) {
      continue;
    }

    // Splice in pre-defined range
    value = IP_RANGES[value];
    trust.splice.apply(trust, [i, 1, ...value]);
    i += value.length - 1;
  }

  return compileTrust(compileRangeSubnets(trust));
}

/**
 * Compile `arr` elements into range subnets.
 *
 * @param {Array} arr
 * @private
 */
function compileRangeSubnets(arr: string[]) {
  const rangeSubnets = new Array(arr.length);

  for (let i = 0; i < arr.length; i++) {
    rangeSubnets[i] = parseipNotation(arr[i]);
  }

  return rangeSubnets;
}

/**
 * Compile range subnet array into trust function.
 *
 * @param {Array} rangeSubnets
 * @private
 */
function compileTrust(rangeSubnets: any[]) {
  // Return optimized function based on length
  const len = rangeSubnets.length;

  return len === 0
    ? trustNone
    : len === 1
    ? trustSingle(rangeSubnets[0])
    : trustMulti(rangeSubnets);
}

/**
 * Parse IP notation string into range subnet.
 *
 * @param {String} note
 * @private
 */
function parseipNotation(note: string) {
  const pos = note.lastIndexOf("/");
  const str = pos !== -1 ? note.substring(0, pos) : note;

  if (!isip(str)) {
    throw new TypeError("invalid IP address: " + str);
  }

  let ip = parseip(str);

  if (pos === -1 && ip.kind() === "ipv6" && ip.isIPv4MappedAddress()) {
    // Store as IPv4
    ip = ip.toIPv4Address();
  }

  const max = ip.kind() === "ipv6" ? 128 : 32;

  let range: string | number | null = pos !== -1
    ? note.substring(pos + 1, note.length)
    : null;

  if (range === null) {
    range = max;
  } else if (DIGIT_REGEXP.test(range)) {
    range = parseInt(range, 10);
  } else if (ip.kind() === "ipv4" && isip(range)) {
    range = parseNetmask(range);
  } else {
    range = null;
  }

  if ((range as number) <= 0 || (range as number) > max) {
    throw new TypeError("invalid range on address: " + note);
  }

  return [ip, range];
}

/**
 * Parse netmask string into CIDR range.
 *
 * @param {String} netmask
 * @private
 */
function parseNetmask(netmask: string) {
  const ip = parseip(netmask);
  const kind = ip.kind();

  return kind === "ipv4" ? ip.prefixLengthFromSubnetMask() : null;
}

/**
 * Determine address of proxied request.
 *
 * @param {Object} request
 * @param {Function|Array|String} trust
 * @public
 */
export function proxyaddr(
  req: ServerRequest,
  trust: Function | string[] | string,
) {
  if (!req) {
    throw new TypeError("req argument is required");
  }

  if (!trust) {
    throw new TypeError("trust argument is required");
  }

  const addrs = all(req, trust);
  const addr = addrs[addrs.length - 1];

  return addr;
}

/**
 * Static trust function to trust nothing.
 *
 * @private
 */
function trustNone() {
  return false;
}

/**
 * Compile trust function for multiple subnets.
 *
 * @param {Array} subnets
 * @private
 */
function trustMulti(subnets: any[]) {
  return function trust(addr: string) {
    if (!isip(addr)) return false;

    const ip = parseip(addr);
    let ipconv;
    const kind = ip.kind();

    for (let i = 0; i < subnets.length; i++) {
      const subnet = subnets[i];
      const subnetip = subnet[0];
      const subnetkind = subnetip.kind();
      const subnetrange = subnet[1];
      let trusted = ip;

      if (kind !== subnetkind) {
        if (subnetkind === "ipv4" && !ip.isIPv4MappedAddress()) {
          // Incompatible IP addresses
          continue;
        }

        if (!ipconv) {
          // Convert IP to match subnet IP kind
          ipconv = subnetkind === "ipv4"
            ? ip.toIPv4Address()
            : ip.toIPv4MappedAddress();
        }

        trusted = ipconv;
      }

      if (trusted.match(subnetip, subnetrange)) {
        return true;
      }
    }

    return false;
  };
}

/**
 * Compile trust function for single subnet.
 *
 * @param {Array} subnet
 * @private
 */
function trustSingle(subnet: any[]) {
  const subnetip = subnet[0];
  const subnetkind = subnetip.kind();
  const subnetisipv4 = subnetkind === "ipv4";
  const subnetrange = subnet[1];

  return function trust(addr: string) {
    if (!isip(addr)) return false;

    let ip = parseip(addr);
    const kind = ip.kind();

    if (kind !== subnetkind) {
      if (subnetisipv4 && !ip.isIPv4MappedAddress()) {
        // Incompatible IP addresses
        return false;
      }

      // Convert IP to match subnet IP kind
      ip = subnetisipv4 ? ip.toIPv4Address() : ip.toIPv4MappedAddress();
    }

    return ip.match(subnetip, subnetrange);
  };
}
