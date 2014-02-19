-include $(PWD)/build/common.mk

BUILD_DIR=$(PWD)/build_stage/system

.PHONY: all clean
all:
	@echo Building system app to build_stage...
	@$(call run-app-js-command, build)
clean:
	@rm -rf ./camera
	@rm -rf $(BUILD_DIR)
