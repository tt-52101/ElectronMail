import path from "path";
import fs, {Stats} from "fs";
import {Packager, Platform, Target} from "app-builder-lib";

import {LOG, LOG_LEVELS, execShell} from "scripts/lib";
import {PACKAGE_NAME} from "src/shared/constants";

const sandboxDisablingLoaderTargets: Array<typeof Target.prototype.name> = [
    "appimage",
    "snap",
];

const afterPack: Packager["afterPack"] = async ({targets, appOutDir, electronPlatformName}) => {
    if (electronPlatformName !== Platform.LINUX.name) {
        return;
    }

    const chromeSandboxBinaryFilePath = path.join(appOutDir, "chrome-sandbox");
    const shouldEnableSandboxDisablingLoader = targets.some(({name}) => {
        return sandboxDisablingLoaderTargets.includes(name.toLowerCase());
    });

    if (shouldEnableSandboxDisablingLoader) {
        await enableSandboxDisablingLoader({appOutDir});
        return;
    }

    await execShell(["chmod", ["4755", chromeSandboxBinaryFilePath]]);
};

export default afterPack;

async function enableSandboxDisablingLoader({appOutDir}: { appOutDir: string }) {
    const appBinaryFileName = PACKAGE_NAME;
    const appBinaryFilePath = path.join(appOutDir, appBinaryFileName);
    const appBinaryStat = fs.statSync(appBinaryFilePath);

    if (!appBinaryStat.isFile()) {
        throw new Error(`"${appBinaryFilePath}" is not a file`);
    }
    if (hasSuidBit(appBinaryStat)) {
        throw new Error(
            `"${appBinaryFilePath}" should not have SUID bit set for "${JSON.stringify(sandboxDisablingLoaderTargets)}" targets`,
        );
    }

    const renamedAppBinaryFileName = `${appBinaryFileName}.bin`;
    const renamedAppBinaryFilePath = path.join(path.dirname(appBinaryFilePath), renamedAppBinaryFileName);
    const appBinaryPreloadFileContent = (() => {
        const replaceMask = "__APP_BINARY_FILE_NAME__";
        const template = fs.readFileSync(path.join(__dirname, "./sandbox-disabling-loader-template.sh")).toString();
        const content = template.replace(replaceMask, renamedAppBinaryFileName);
        if (content === template) {
            throw new Error(`Failed to replace "${replaceMask}" mask`);
        }
        return content;
    })();

    await execShell(["mv", [appBinaryFilePath, renamedAppBinaryFilePath]]);

    LOG(
        LOG_LEVELS.title(`Writing ${LOG_LEVELS.value(appBinaryFilePath)} file with content:\n`),
        LOG_LEVELS.value(appBinaryPreloadFileContent),
    );
    fs.writeFileSync(appBinaryFilePath, appBinaryPreloadFileContent);

    await execShell(["chmod", ["+x", appBinaryFilePath]]);
}

function hasSuidBit({mode}: Stats): boolean {
    const suidBit = 0x800; // same as 0b100000000000 binary or 2048 decimal (first permission bit the SUID bit)
    return Boolean(mode & suidBit); // tslint:disable-line:no-bitwise
}
