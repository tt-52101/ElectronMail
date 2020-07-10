#!/bin/bash

set -Eeuo pipefail

yarn app:dist
yarn test:e2e
yarn scripts/dist-packages/print-hashes
yarn scripts/dist-packages/upload
