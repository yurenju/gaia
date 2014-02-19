-include $(PWD)/build/common.mk

BUILD_DIR=$(PWD)/build_stage/sms

.PHONY: all clean
all:
	@echo Building sms app to build_stage...
	@$(call run-app-js-command, build)
clean:
	@rm -rf $(BUILD_DIR)
