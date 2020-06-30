import { wrapPromise } from "./wrapPromise.ts";

const doggoApiUrl = "/api/v1/doggos?count=100";

export function fetchDoggos() {
  const promise = fetch(doggoApiUrl)
    .then((res) => res.json());

  return wrapPromise(promise);
}
