.PHONY: clean all test publish

test:
	@npm test

build:
	@gulp

install:
	@rm -rf .hyphy && wget http://github.com/veg/hyphy/archive/2.2.6.tar.gz && tar xvzf 2.2.6.tar.gz && mv hyphy-2.2.6 .hyphy;	
	@cd ./.hyphy/ && cmake . && make HYPHYMP && cd ../
	@npm install
	@bower install
	@gulp
	@mkdir -p ./uploads/msa ./uploads/hivtrace;
