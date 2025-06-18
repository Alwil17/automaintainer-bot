import { Context } from "probot";
import yaml from "js-yaml";

export interface AutoMaintainerConfig {
  todoMarkers: string[];         // e.g., ["TODO:", "FIXME:"]
  defaultLabels: string[];       // e.g., ["triage"]
  autoCloseResolved: boolean;    // For later use
  plan?: string;                 // Marketplace plan information
  welcomeMessage?: string;       // Message de bienvenue personnalisé
}

const defaultConfig: AutoMaintainerConfig = {
  todoMarkers: ["TODO:"],
  defaultLabels: ["triage"],
  autoCloseResolved: false,
};

export async function loadRepoConfig(context: Context): Promise<AutoMaintainerConfig> {
  try {
    const configPath = "./.github/auto-maintainer.yml";
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

/**
 * Verify if a repository has access to a specific feature based on its plan
 * 
 * @param config Repository configuration with plan information
 * @param feature Feature to check access for
 * @returns Boolean indicating if the feature is available
 */
export function hasFeatureAccess(config: AutoMaintainerConfig, feature: string): boolean {
  // If no plan is specified, assume it's the free tier
  const plan = config.plan ?? "free";
  
  // Basic features available to all plans
  const basicFeatures = ["todo-detection", "basic-labels"];
  if (basicFeatures.includes(feature)) return true;
  
  // Advanced features based on plan
  if (feature === "custom-todo-markers") {
    return ["pro", "team", "enterprise"].includes(plan.toLowerCase());
  }
  
  if (feature === "custom-issue-templates") {
    return ["team", "enterprise"].includes(plan.toLowerCase());
  }
  
  if (feature === "custom-workflows" || feature === "priority-support") {
    return ["enterprise"].includes(plan.toLowerCase());
  }
  
  // Unknown feature
  return false;
}
