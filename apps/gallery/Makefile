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

all: concatenated_scripts
	@echo Building gallery app to build_stage...
	@$(call run-app-js-command, build)

concatenated_scripts: $(BUILD_DIR)/js/frame_scripts.js $(BUILD_DIR)/js/metadata_scripts.js

$(BUILD_DIR)/js/frame_scripts.js: $(FULLSCREEN_SCRIPTS)
	cat $(FULLSCREEN_SCRIPTS) > $(BUILD_DIR)/js/frame_scripts.js

$(BUILD_DIR)/js/metadata_scripts.js: $(METADATA_SCRIPTS)
	cat $(METADATA_SCRIPTS) > $(BUILD_DIR)/js/metadata_scripts.js
