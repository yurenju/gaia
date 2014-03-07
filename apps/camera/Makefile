-include $(PWD)/build/common.mk

ifdef XPCSHELLSDK
	JS_RUN_ENVIRONMENT := $(XULRUNNERSDK) $(XPCSHELLSDK)
else ifndef JS_RUN_ENVIRONMENT
	NODEJS := $(shell which node)
	JS_RUN_ENVIRONMENT := $(NODEJS)
endif

SHARED_SOURCES := $(call rwildcard,../../shared/,*)
JS_SOURCES := $(call rwildcard,js/,*)
LOCALES_SOURCES := $(call rwildcard,locales/,*)
RESOURCES_SOURCES := $(call rwildcard,resources/,*)
STYLE_SOURCES := $(call rwildcard,style/,*)
BUILD_SOURCES := $(call rwildcard,build/,*)

export STAGE_APP_DIR

.PHONY: clean
all: js_environment_available $(STAGE_APP_DIR)/js/main.js

$(STAGE_APP_DIR):
	mkdir -p $(STAGE_APP_DIR)

$(STAGE_APP_DIR)/js/main.js: build/*.js manifest.webapp index.html $(SHARED_SOURCES) $(JS_SOURCES) $(LOCALES_SOURCES) $(RESOURCES_SOURCES) $(STYLE_SOURCES) $(BUILD_SOURCES) | $(STAGE_APP_DIR)
ifdef XPCSHELLSDK
	@$(call run-app-js-command, build)
else
	mkdir -p $(STAGE_APP_DIR)/js
	@$(NODEJS) build/configure.js
endif
	rm -rf $(STAGE_APP_DIR)/shared
	rm -rf $(STAGE_APP_DIR)/style
	cp -rp ../../shared $(STAGE_APP_DIR)/
	$(JS_RUN_ENVIRONMENT) ../../build/r.js -o build/require_config.jslike

clean:
	rm -rf $(STAGE_APP_DIR)

js_environment_available:
ifndef JS_RUN_ENVIRONMENT
	$(error Environment to run r.js is not available. Please Install NodeJS -- (use aptitude on linux or homebrew on osx))
endif

