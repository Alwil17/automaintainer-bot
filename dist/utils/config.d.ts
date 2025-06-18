import { Context } from "probot";
export interface AutoMaintainerConfig {
    todoMarkers: string[];
    defaultLabels: string[];
    autoCloseResolved: boolean;
    plan?: string;
    welcomeMessage?: string;
    welcomePrMessage?: string;
}
export declare function loadRepoConfig(context: Context): Promise<AutoMaintainerConfig>;
/**
 * Verify if a repository has access to a specific feature based on its plan
 *
 * @param config Repository configuration with plan information
 * @param feature Feature to check access for
 * @returns Boolean indicating if the feature is available
 */
export declare function hasFeatureAccess(config: AutoMaintainerConfig, feature: string): boolean;
