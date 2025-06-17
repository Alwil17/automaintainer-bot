import { Context } from "probot";
import yaml from "js-yaml";

export interface AutoMaintainerConfig {
  todoMarkers: string[];         // e.g., ["TODO:", "FIXME:"]
  defaultLabels: string[];       // e.g., ["triage"]
  autoCloseResolved: boolean;    // For later use
}

const defaultConfig: AutoMaintainerConfig = {
  todoMarkers: ["TODO:"],
  defaultLabels: ["triage"],
  autoCloseResolved: false,
};

export async function loadRepoConfig(context: Context): Promise<AutoMaintainerConfig> {
  try {
    const configPath = ".github/auto-maintainer.yml";
    const res = await context.octokit.repos.getContent({
      owner: context.repo().owner,
      repo: context.repo().repo,
      path: configPath,
      ref: (context.payload as any)?.repository?.default_branch ?? "main",
    });

    if (!("content" in res.data)) return defaultConfig;

    const content = Buffer.from(res.data.content, "base64").toString("utf-8");
    const parsed = yaml.load(content) as Partial<AutoMaintainerConfig>;

    return {
      ...defaultConfig,
      ...parsed,
    };
  } catch (err) {
    context.log.warn("Could not load config file, using default config.");
    return defaultConfig;
  }
}
