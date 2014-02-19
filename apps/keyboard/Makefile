-include $(PWD)/build/common.mk

BUILD_DIR=$(PWD)/build_stage/keyboard

.PHONY: all clean
all: clean
	@echo Building keyboard app to build_stage...
	@$(call run-app-js-command, build)
clean:
	@rm -rf $(BUILD_DIR)
