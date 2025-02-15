.ONESHELL:

all: help

build: ## build extension
	tsc
	node ./esbuild.js --production

publish: build ## publish extension
	node -e 'let pkg=require("./package.json"); let v=pkg.version.split("."); v[2]++; pkg.version=v.join("."); require("fs").writeFileSync("./package.json", JSON.stringify(pkg, null, 4)); console.log(pkg.version);' > .version
	npx vsce package -o dist/
	npx vsce publish -i dist/vscode-twm-`cat .version`.vsix
	rm .version

login: ## login into azure
	npx vsce login dimfred

help: ## print this help
	@grep '##' $(MAKEFILE_LIST) \
		| grep -Ev 'grep|###' \
		| sed -e 's/^\([^:]*\):[^#]*##\([^#]*\)$$/\1:\2/' \
		| awk -F ":" '{ printf "%-34s%s\n", "\033[1;32m" $$1 ":\033[0m", $$2 }' \
		| grep -v 'sed'
