import fastGlob from "fast-glob";
import path from "path";

import {CWD, LOG} from "scripts/lib";
import {FOLDER_AS_DOMAIN_ENTRIES} from "scripts/prepare-webclient/const";
import {PROVIDER_REPOS} from "src/shared/constants";
import {sanitizeFastGlobPattern} from "src/shared/util";

const delimiter = ";";

LOG(
    (["WebClient", "proton-mail-settings", "proton-contacts", "proton-calendar"] as const)
        .map((repo) => {
            return `./output/git/${repo}/${PROVIDER_REPOS[repo].commit}/*/${path.normalize(PROVIDER_REPOS[repo].repoRelativeDistDir)}`;
        })
        .filter((value) => {
            const existingFiles = fastGlob.sync(
                sanitizeFastGlobPattern(
                    path.join(CWD, value, "index.html")
                ),
                {
                    absolute: true,
                    deep: 3,
                    onlyFiles: true,
                    stats: false,
                },
            );
            return existingFiles.length === FOLDER_AS_DOMAIN_ENTRIES.length;
        })
        .join(delimiter),
);
