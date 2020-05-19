.PHONY: benchmark doc fmt test

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
	@typedoc --ignoreCompilerErrors --out ./docs --mode modules --excludeNotDocumented --excludePrivate ./src

fmt:
	@deno fmt

test:
	@deno test
