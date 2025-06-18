import yaml from "js-yaml";
const defaultConfig = {
    todoMarkers: ["TODO:"],
    defaultLabels: ["triage"],
    autoCloseResolved: false,
};
export async function loadRepoConfig(context) {
    try {
        const configPath = ".github/auto-maintainer.yml";
        const res = await context.octokit.repos.getContent({
            owner: context.repo().owner,
            repo: context.repo().repo,
            path: configPath,
            ref: context.payload?.repository?.default_branch ?? "main",
        });
        if (!("content" in res.data))
            return defaultConfig;
        const content = Buffer.from(res.data.content, "base64").toString("utf-8");
        const parsed = yaml.load(content);
        return {
            ...defaultConfig,
            ...parsed,
        };
    }
    catch (err) {
        context.log.warn("Could not load config file, using default config.");
        return defaultConfig;
    }
}
//# sourceMappingURL=config.js.map