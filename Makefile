.PHONY: benchmark build ci deps doc fmt fmt-check lint test typedoc

FILES_TO_FORMAT = ./src ./benchmarks/ ./test ./examples deps.ts mod.ts version.ts

benchmark:
	@echo "opine: 1 middleware"
	@echo "================================"
	@./benchmarks/run.sh 1 ./benchmarks/middleware.ts
	@echo ""
	@echo "opine: 10 middleware"
	@echo "================================"
	@./benchmarks/run.sh 10 ./benchmarks/middleware.ts
	@echo ""
	@echo "opine: 50 middleware"
	@echo "================================"
	@./benchmarks/run.sh 50 ./benchmarks/middleware.ts
	@echo ""
	@echo "std/http benchmark"
	@echo "================================"
	@./benchmarks/run.sh 0 https://deno.land/std/http/bench.ts
	@echo ""
	@echo "deno_http_native benchmark"
	@echo "================================"
	@./benchmarks/run.sh 0 https://raw.githubusercontent.com/denoland/deno/main/cli/bench/deno_http_native.js
	@echo ""

build:
	@deno run --allow-net="deno.land" --allow-env --reload mod.ts

ci:
	@make fmt-check
	@make build
	@make test

deps:
	@npm install -g typescript@4.9.5 typedoc@0.19.2

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt $(FILES_TO_FORMAT)

fmt-check:
	@deno fmt --check $(FILES_TO_FORMAT)

lint:
	@deno lint --unstable $(FILES_TO_FORMAT)

test:
	@deno test --allow-net --allow-read ./test/units/
	@deno test --allow-net --allow-read --allow-env --unstable ./examples/

typedoc:
	@rm -rf docs
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals --name opine ./src
	@make fmt
	@make fmt
	@echo 'future: true\nencoding: "UTF-8"\ninclude:\n  - "_*_.html"\n  - "_*_.*.html"' > ./docs/_config.yaml
