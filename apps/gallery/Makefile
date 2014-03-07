-include $(PWD)/build/common.mk

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

.PHONY: clean

all: concatenated_scripts $(STAGE_APP_DIR) $(call rwildcard,$(APP_DIR),*)
	@echo Building gallery app to build_stage...
	@$(call run-app-js-command, build)

concatenated_scripts: $(STAGE_APP_DIR)/js/frame_scripts.js $(STAGE_APP_DIR)/js/metadata_scripts.js

$(STAGE_APP_DIR): clean
	@cp -r $(APP_DIR) $(STAGE_APP_DIR)

$(STAGE_APP_DIR)/js/frame_scripts.js: $(FULLSCREEN_SCRIPTS) $(STAGE_APP_DIR)
	cat $(FULLSCREEN_SCRIPTS) > $(STAGE_APP_DIR)/js/frame_scripts.js

$(STAGE_APP_DIR)/js/metadata_scripts.js: $(METADATA_SCRIPTS) $(STAGE_APP_DIR)
	cat $(METADATA_SCRIPTS) > $(STAGE_APP_DIR)/js/metadata_scripts.js

clean:
	rm -rf $(STAGE_APP_DIR)
