-include $(PWD)/build/common.mk

BUILD_DIR=$(PWD)/build_stage/wallpaper

.PHONY: all clean
all:
	@echo Building wallpaper app to build_stage...
	@rm -rf $(BUILD_DIR)/Makefile $(BUILD_DIR)/build $(BUILD_DIR)/test
	@$(call run-app-js-command, build)
clean:
	@rm -rf $(BUILD_DIR)
