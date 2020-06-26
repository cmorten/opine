.PHONY: benchmark build ci deps doc fmt fmt-check lock test typedoc

benchmark:
	@./benchmarks/run.sh 1 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 5 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 10 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 15 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 20 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 30 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 50 ./benchmarks/middleware.ts
	@./benchmarks/run.sh 100 ./benchmarks/middleware.ts
	@echo

build:
	@deno run --lock=lock.json --reload mod.ts

ci:
	@make fmt-check
	@make build
	@make test

deps:
	@npm install -g typescript typedoc

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt

fmt-check:
	@deno fmt --check

lock:
	@deno run --lock=lock.json --lock-write --reload mod.ts

test:
	@deno test --allow-net --allow-read ./test/units/

typedoc:
	@rm -rf docs
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals --name opine ./src
	@make fmt
	@make fmt
	@echo 'future: true\nencoding: "UTF-8"\ninclude:\n  - "_*_.html"\n  - "_*_.*.html"' > ./docs/_config.yaml
