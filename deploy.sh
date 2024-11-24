#!/bin/sh

VERSION=$(jq -r '.version' bookmark-info-chrome-mv3/manifest.json)

node tools/mv-changes-to-firefox.mjs
echo Move changes to Firefox: Ok
# TODO if error exit

cd bookmark-info-firefox-mv2
web-ext build --overwrite-dest
cd - > /dev/null
# TODO if error exit

DISTRIBUTION_CHROME_PATH=~/.tmp/bookmark-info-chrome-mv3-v$VERSION.zip
rm -f $DISTRIBUTION_CHROME_PATH
cd bookmark-info-chrome-mv3
zip -r -q $DISTRIBUTION_CHROME_PATH .
cd - > /dev/null
# TODO if error exit

# DISTRIBUTION_FF_FILE=$(ls bookmark-info-firefox-mv2/web-ext-artifacts | sort | tail -1)
DISTRIBUTION_FF_FILE=bookmark_info-$VERSION.zip
DISTRIBUTION_FF_PATH=~/.tmp/$DISTRIBUTION_FF_FILE
rm -f $DISTRIBUTION_FF_PATH
cp bookmark-info-firefox-mv2/web-ext-artifacts/$DISTRIBUTION_FF_FILE $DISTRIBUTION_FF_PATH

echo SUCCESS
echo Distribution for Chrome: $DISTRIBUTION_CHROME_PATH
echo Distribution for Firefox: $DISTRIBUTION_FF_PATH
