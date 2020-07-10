#!/bin/bash

set -Eeuo pipefail
set -x

./scripts/ci/nix/prepare-webclients.sh

yarn app:dist
yarn test:e2e
yarn scripts/dist-packages/print-hashes
yarn scripts/dist-packages/upload
