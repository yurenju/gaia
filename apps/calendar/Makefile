-include $(PWD)/build/common.mk

$(STAGE_APP_DIR): $(call rwildcard,$(APP_DIR),*)
	rm -rf $(STAGE_APP_DIR)
	cp -r "$(APP_DIR)" "$(STAGE_APP_DIR)"
	$(call run-app-js-command, build)

.PHONY: web_assets
web_assets:
	web_assets install $$PWD
