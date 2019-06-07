import path from "path";
import {AfterPackContext, Configuration} from "app-builder-lib";

import {APP_EXEC_PATH_RELATIVE_HUNSPELL_DIR} from "src/shared/constants";
import {LOG, LOG_LEVELS, execShell} from "scripts/lib";
import {copyDictionaryFiles} from "scripts/electron-builder/lib";

const hook: Required<Configuration>["afterPack"] = async (context) => {
    const electronPlatformNameLoweredCase = context.electronPlatformName.toLowerCase();

    if (electronPlatformNameLoweredCase.startsWith("lin")) {
        await linux(context);
        return;
    }

    if (electronPlatformNameLoweredCase.startsWith("win")) {
        await windows(context);
    }
};

export default hook;

async function linux({targets, appOutDir}: AfterPackContext) {
    if (targets.length !== 1) {
        throw new Error(`hook: afterPack] Only one target is allowed at a time for Linux platform`);
    }

    const [target] = targets;
    const targetNamesToSkip: Readonly<Array<typeof target.name>> = ["appimage", "snap"];
    const skipping = targetNamesToSkip.includes(target.name.toLowerCase());

    if (skipping) {
        LOG(LOG_LEVELS.warning(`[hook: afterPack] Skipping processing ${LOG_LEVELS.value(target.name)} target`));
        return;
    }

    LOG(LOG_LEVELS.title(`hook: afterPack] Processing ${LOG_LEVELS.value(target.name)} target`));

    await execShell(["chmod", ["4755", path.join(appOutDir, "chrome-sandbox")]]);
}

async function windows({appOutDir}: AfterPackContext) {
    await copyDictionaryFiles(path.join(appOutDir, APP_EXEC_PATH_RELATIVE_HUNSPELL_DIR));
}
