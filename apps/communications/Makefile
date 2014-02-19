-include $(PWD)/build/common.mk

BUILD_DIR=$(STAGE_DIR)/communications

.PHONY: all
all:
	@echo Building communications app to build_stage...
	@rm -rf $(BUILD_DIR)/Makefile $(BUILD_DIR)/build $(BUILD_DIR)/test
	@$(call run-app-js-command, build)
