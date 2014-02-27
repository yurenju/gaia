-include $(PWD)/build/common.mk

ifndef STAGE_DIR
	BUILD_DIR=../../build_stage/camera
else
	BUILD_DIR=$(STAGE_DIR)/camera
endif

ifdef XPCSHELLSDK
	JS_RUN_ENVIRONMENT := $(XULRUNNERSDK) $(XPCSHELLSDK)
else ifndef JS_RUN_ENVIRONMENT
	NODEJS := $(shell which node)
	JS_RUN_ENVIRONMENT := $(NODEJS)
endif

rwildcard=$(wildcard $1$2) $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2))

SHARED_SOURCES := $(call rwildcard,../../shared/,*)
JS_SOURCES := $(call rwildcard,js/,*)
LOCALES_SOURCES := $(call rwildcard,locales/,*)
RESOURCES_SOURCES := $(call rwildcard,resources/,*)
STYLE_SOURCES := $(call rwildcard,style/,*)
BUILD_SOURCES := $(call rwildcard,build/,*)

ifndef STAGE_DIR
	BUILD_DIR=../../build_stage/camera
else
	BUILD_DIR=$(STAGE_DIR)/camera
endif

export BUILD_DIR

.PHONY: clean
all: js_environment_available $(BUILD_DIR)/js/main.js

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/js/main.js: build/*.js manifest.webapp index.html $(SHARED_SOURCES) $(JS_SOURCES) $(LOCALES_SOURCES) $(RESOURCES_SOURCES) $(STYLE_SOURCES) $(BUILD_SOURCES) | $(BUILD_DIR)
ifdef XPCSHELLSDK
	@$(call run-app-js-command, build)
else
	mkdir -p $(BUILD_DIR)/js
	@$(NODEJS) build/configure.js
endif
	rm -rf $(BUILD_DIR)/shared
	rm -rf $(BUILD_DIR)/style
	cp -rp ../../shared $(BUILD_DIR)/
	$(JS_RUN_ENVIRONMENT) ../../build/r.js -o build/require_config.jslike
	rm -rf $(BUILD_DIR)/shared

clean:
	rm -rf $(BUILD_DIR)

js_environment_available:
ifndef JS_RUN_ENVIRONMENT
	$(error Environment to run r.js is not available. Please Install NodeJS -- (use aptitude on linux or homebrew on osx))
endif

