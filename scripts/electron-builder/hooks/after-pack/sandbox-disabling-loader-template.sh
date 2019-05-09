#!/bin/bash

# "electron --version" command fails if sandbox is unsupported by the system
# so we use this command as sandbox support test
# see details here:
# - https://github.com/electron/electron/issues/16631
# - https://github.com/electron/electron/issues/17972

C_DEFAULT="\e[39m"
C_RED="\e[31m"
C_YELLOW="\e[33m"
C_CYAN="\e[96m"

printEvalCmd() {
    echo -e "Execute the command: ${C_CYAN}${EVAL_CMD}${C_DEFAULT}"
}

BINARY=${BASH_SOURCE%/*}/__APP_BINARY_FILE_NAME__
BINARY_ARGS=""

EVAL_CMD="${BINARY} --version 2>&1"; printEvalCmd;
VERSION_EXEC_OUTPUT=$(eval ${EVAL_CMD})

VERSION_EXEC_EXIT_CODE=$?

if [ "${VERSION_EXEC_EXIT_CODE}" != 0 ]; then
	echo -e "${C_RED}${VERSION_EXEC_OUTPUT}${C_DEFAULT}"
	BINARY_ARGS="--no-sandbox --disable-setuid-sandbox"
	echo -e "${C_YELLOW}Falling back to starting the app with ${BINARY_ARGS} arguments ${C_DEFAULT}"
fi

EVAL_CMD="${BINARY} --version ${BINARY_ARGS}"; printEvalCmd;
echo "Electron version: $(eval ${EVAL_CMD})"

EVAL_CMD="${BINARY} ${BINARY_ARGS} $@"; printEvalCmd;
$(eval ${EVAL_CMD})
