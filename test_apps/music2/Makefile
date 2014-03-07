METADATA_SCRIPTS = \
 ../../shared/js/blobview.js \
 js/metadata.js

.PHONY: clean

all: concatenated_scripts $(STAGE_APP_DIR)

$(STAGE_APP_DIR):
	cp -r "$(APP_DIR)" "$(STAGE_APP_DIR)"

concatenated_scripts: $(STAGE_APP_DIR)/js/metadata_scripts.js $(STAGE_APP_DIR)

$(STAGE_APP_DIR)/js/metadata_scripts.js: Makefile $(METADATA_SCRIPTS) $(STAGE_APP_DIR)
	cat $(METADATA_SCRIPTS) > $(STAGE_APP_DIR)/js/metadata_scripts.js

clean:
	@rm -rf $(STAGE_APP_DIR)
