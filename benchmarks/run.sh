#!/bin/bash
echo
MW=$1 deno run --allow-env --allow-net --allow-read --unstable $2 'localhost:3333' &
pid=$!

while [[ "$(curl -s -o /dev/null -I -w '%{http_code}' 'http://localhost:3333/')" != "200" ]]; do
  sleep 5;
done

wrk 'http://localhost:3333/?foo[bar]=baz' -d '3s' --latency

kill $pid
