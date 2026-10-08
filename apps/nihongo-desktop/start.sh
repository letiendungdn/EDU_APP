#!/bin/sh
cd "$(dirname "$0")"
exec "./node_modules/electron/dist/Electron.app/Contents/MacOS/Electron" .
