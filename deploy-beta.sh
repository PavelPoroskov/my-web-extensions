#!/bin/sh

VERSION=$(jq -r '.version' bookmark-info-chrome-mv3/manifest.json)
WASERROR=

node tools/turn-on-logging.mjs
if [ $? -ne 0 ]; then
    echo "Command failed! Turn on logging"
    exit 1
fi
echo Turn on logging: Ok

node tools/mv-changes-to-firefox.mjs
if [ $? -ne 0 ]; then
    echo "Command failed! Move changes to Firefox"
    exit 1
fi
echo Move changes to Firefox: Ok

cd bookmark-info-firefox-mv2
web-ext build --overwrite-dest
if [ $? -ne 0 ]; then
    echo "Command failed! web-ext build"
    WASERROR=1
fi
cd - > /dev/null
if [ -n "$WASERROR" ]; then
    exit 1
fi

DISTRIBUTION_FF_FILE_DEFAULT=bookmark_info-$VERSION.zip
DISTRIBUTION_FF_FILE=bookmark_info-firefox-mv2-v${VERSION}b.zip
DISTRIBUTION_FF_PATH=/shared-with-virt/$DISTRIBUTION_FF_FILE

cp bookmark-info-firefox-mv2/web-ext-artifacts/$DISTRIBUTION_FF_FILE_DEFAULT $DISTRIBUTION_FF_PATH

if [ $? -ne 0 ]; then
    echo "Command failed! cp bookmark-info-firefox-mv2/web-ext-artifacts/$DISTRIBUTION_FF_FILE_DEFAULT $DISTRIBUTION_FF_PATH"
    exit 1
fi

echo SUCCESS
echo Distribution for Firefox: $DISTRIBUTION_FF_PATH
