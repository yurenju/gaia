-include $(PWD)/build/common.mk

.PHONY: all clean
all: clean
	@echo Building browser app to build_stage...
	@$(call run-app-js-command, build)
clean:
	@rm -rf $(BUILD_DIR)
