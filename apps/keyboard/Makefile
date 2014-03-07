-include $(PWD)/build/common.mk

.PHONY: all clean
all: clean
	@echo Building keyboard app to build_stage...
	@$(call run-app-js-command, build)
clean:
	@rm -rf $(STAGE_APP_DIR)
