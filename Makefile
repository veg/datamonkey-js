.PHONY: clean all test publish

test:
	@npm test

install:
	@rm -rf .hyphy && wget http://github.com/veg/hyphy/archive/2.2.6.tar.gz && tar xvzf 2.2.6.tar.gz && mv hyphy-2.2.6 .hyphy;	
	@cd ./.hyphy/ && cmake . && make HYPHYMP && cd ../
	@rm -rf .tn93 && wget http://github.com/veg/tn93/archive/v1.0.2.tar.gz  && tar xvzf v1.0.2.tar.gz && mv tn93-1.0.2 .tn93;	
	@cd ./.tn93/ && cmake . && make && cd ../
	@yarn install
	@webpack
	@mkdir -p ./uploads/msa ./uploads/hivtrace;
