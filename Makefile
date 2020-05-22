.PHONY: benchmark doc fmt update-lock test typedoc

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

doc:
	@deno doc ./mod.ts

fmt:
	@deno fmt

update-lock:
	@deno run --lock=lock.json --lock-write --reload mod.ts

test:
	@deno test ./test

typedoc:
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --includeDeclarations --excludeExternals --includes ./typings/index.d.ts ./src
