#!/bin/sh

cd bookmark-info-firefox-mv2
web-ext build
cd -

cd bookmark-info-chrome-mv3
VERSION=$(jq -r '.version' manifest.json)
zip -r ~/.tmp/bookmark-info-chrome-mv3-v$VERSION.zip .
cd -

cp bookmark-info-firefox-mv2/web-ext-artifacts/$(ls bookmark-info-firefox-mv2/web-ext-artifacts | sort | tail -1) ~/.tmp/


