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

.PHONY: all clean $(STAGE_APP_DIR)/resources/gaia_commit.txt $(STAGE_APP_DIR)/resources/support.json $(STAGE_APP_DIR)/resources/sensors.json

all: js_environment_available $(STAGE_APP_DIR)/resources/gaia_commit.txt $(STAGE_APP_DIR)/resources/support.json $(STAGE_APP_DIR)/resources/sensors.json $(STAGE_APP_DIR)/js/main.js

clean:
	rm -rf $(STAGE_APP_DIR)

js_environment_available:
ifndef JS_RUN_ENVIRONMENT
  $(error Environment to run r.js is not available. Please Install NodeJS -- (use aptitude on linux or homebrew on osx))
endif

GAIA_ROOT_PATH?=../..

# Generate a text file containing the current changeset of Gaia
$(STAGE_APP_DIR)/resources/gaia_commit.txt:
	mkdir -p $(STAGE_APP_DIR)/resources/
	@(if [ -e ${GAIA_ROOT_PATH}/gaia_commit_override.txt ]; then \
		cp ${GAIA_ROOT_PATH}/gaia_commit_override.txt $(STAGE_APP_DIR)/resources/gaia_commit.txt; \
	elif [ -d ${GAIA_ROOT_PATH}/.git ]; then \
		git --git-dir=${GAIA_ROOT_PATH}/.git log -1 --format="%H%n%ct" HEAD > $(STAGE_APP_DIR)/resources/gaia_commit.txt; \
	else \
		echo 'Unknown Git commit; build date shown here.' > $(STAGE_APP_DIR)/resources/gaia_commit.txt; \
		date +%s >> $(STAGE_APP_DIR)/resources/gaia_commit.txt; \
	fi)

$(STAGE_APP_DIR)/js/main.js: manifest.webapp index.html build/* $(SHARED_SOURCES) $(JS_SOURCES) $(LOCALES_SOURCES) $(RESOURCES_SOURCES) $(STYLE_SOURCES) $(BUILD_SOURCES)
	@rm -rf $(STAGE_APP_DIR)
	@mkdir -p $(STAGE_APP_DIR)
	cp -rp ../../shared $(STAGE_APP_DIR)/shared
	$(JS_RUN_ENVIRONMENT) ../../build/r.js -o build/require_config.jslike

$(STAGE_APP_DIR)/resources/support.json $(STAGE_APP_DIR)/resources/sensors.json: build/build.js
	@$(call run-app-js-command, build)
