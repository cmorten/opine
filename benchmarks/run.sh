#!/bin/bash
echo
MW=$1 deno run --allow-env --allow-net $2 &
pid=$!

while [[ "$(curl -s -o /dev/null -I -w '%{http_code}' 'http://localhost:3333/')" != "200" ]]; do
  sleep 5;
done

wrk 'http://localhost:3333/?foo[bar]=baz' \
  -d 3 \
  -c 50 \
  -t 8 \
  | grep 'Requests/sec' \
  | awk '{ print "  " $2 " RPS" }'

kill $pid
