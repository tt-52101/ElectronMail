#!/bin/bash

set -Eeuo pipefail

./scripts/ci/prepare-webclients.sh

yarn app:dist

# needed for e2e starts with SUID sandbox if user namespacing disabled
# https://github.com/electron/electron/issues/16631#issuecomment-476082063
# https://github.com/electron/electron/issues/17972
sudo ./scripts/prepare-chrome-sandbox.sh ./node_modules/electron/dist/chrome-sandbox

yarn test:e2e

# TODO use own docker image
# --env-file: https://github.com/electron-userland/electron-builder/issues/2450
docker run --rm -ti \
    --env-file <(env | grep -vE '\r|\n' | grep -iE '^(DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR|BUILD_)[A-Z_]*=') \
    -v ${PWD}:/project \
    -v ${PWD##*/}-node-modules:/project/node_modules \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder \
    /bin/bash ./scripts/ci/travis/build-linux-docker.sh

yarn scripts/dist-packages/print-hashes
yarn scripts/dist-packages/upload
