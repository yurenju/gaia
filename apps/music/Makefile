METADATA_SCRIPTS = \
 ../../shared/js/blobview.js \
 js/metadata.js

$(STAGE_APP_DIR): concatenated_scripts
	rm -rf $(STAGE_APP_DIR)
	cp -r "$(APP_DIR)" "$(STAGE_APP_DIR)"

concatenated_scripts: js/metadata_scripts.js

js/metadata_scripts.js: Makefile $(METADATA_SCRIPTS)
	cat $(METADATA_SCRIPTS) > js/metadata_scripts.js
