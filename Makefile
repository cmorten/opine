.PHONY: benchmark build ci doc fmt fmt-check lock precommit test typedoc

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

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt

fmt-check:
	@deno fmt --check

lock:
	@deno run --lock=lock.json --lock-write --reload mod.ts

precommit:
	@make typedoc
	@make fmt
	@make lock

test:
	@deno test --allow-net ./test/units/

typedoc:
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals ./src

