#!/bin/bash

set -Eeuo pipefail

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash

export NVM_DIR=~/.nvm
source ~/.nvm/nvm.sh
nvm install $TRAVIS_NODE_VERSION
nvm use $TRAVIS_NODE_VERSION

apt-get update
apt-get install --yes --no-install-recommends libtool automake squashfs-tools libxss-dev snapcraft

yarn --pure-lockfile
yarn clean:prebuilds
yarn scripts/electron-builder/sequential-dist-linux
