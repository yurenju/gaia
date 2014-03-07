-include $(PWD)/build/common.mk

BUILD_DIR=$(STAGE_DIR)/gallery

FULLSCREEN_SCRIPTS = \
 ../../shared/js/gesture_detector.js \
 ../../shared/js/format.js \
 ../../shared/js/media/video_player.js \
 ../../shared/js/media/media_frame.js \
 js/frames.js

METADATA_SCRIPTS = \
 ../../shared/js/blobview.js \
 ../../shared/js/media/jpeg_metadata_parser.js \
 ../../shared/js/media/get_video_rotation.js \
 js/imagesize.js \
 js/MetadataParser.js

.PHONY: reset

$(STAGE_APP_DIR): concatenated_scripts $(call rwildcard,$(APP_DIR),*)
	@cp -r $(APP_DIR) $(STAGE_APP_DIR)
	@echo Building gallery app to build_stage...
	@$(call run-app-js-command, build)

concatenated_scripts: $(STAGE_APP_DIR)/js/frame_scripts.js $(STAGE_APP_DIR)/js/metadata_scripts.js

$(STAGE_APP_DIR)/js/frame_scripts.js: $(FULLSCREEN_SCRIPTS) reset
	cat $(FULLSCREEN_SCRIPTS) > $(STAGE_APP_DIR)/js/frame_scripts.js

$(STAGE_APP_DIR)/js/metadata_scripts.js: $(METADATA_SCRIPTS) reset
	cat $(METADATA_SCRIPTS) > $(STAGE_APP_DIR)/js/metadata_scripts.js

reset:
	rm -rf $(STAGE_APP_DIR)
	mkdir -p $(STAGE_APP_DIR) $(STAGE_APP_DIR)/js
