@echo off
rem ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
rem ;; yuibompressor.bat configuration file       ;;
rem ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
set YUI_TYPE=css
set YUI_BUILD_NAME=style
set YUI_FOLDER=yuibompressor
set YUI_FILE_LIST=applet-css-list.txt
set YUI_FOLDER_DEST=..
set YUI_FOLDER_SOURCE=..
set YUI_NO_MUNGE=1
set YUI_COMPRESSOR_VERSION=2.4.2
call yuibompressor\yuibompressor.bat

cd "..\"

del all.debug.css