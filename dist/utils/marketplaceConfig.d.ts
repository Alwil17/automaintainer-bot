import { Context } from "probot";
export interface MarketplaceConfig {
    sendWelcomeMessage: boolean;
    sendCancellationSurvey: boolean;
    notifyOnPlanChange: boolean;
    freeTierFeatures: string[];
    proPlanFeatures: string[];
    teamPlanFeatures: string[];
    enterprisePlanFeatures: string[];
}
/**
 * Loads marketplace configuration from environment or default values
 *
 * @param context - The Probot context
 * @returns The marketplace configuration
 */
export declare function loadMarketplaceConfig(context: Context): Promise<MarketplaceConfig>;
/**
 * Determines if a feature is available for a given plan
 *
 * @param feature The feature to check
 * @param planName The name of the plan
 * @returns True if the feature is available in the plan
 */
export declare function isFeatureAvailable(feature: string, planName: string): boolean;
/**
 * Gets the list of features available for a plan
 *
 * @param planName The name of the plan
 * @returns Array of available features
 */
export declare function getAvailableFeatures(planName: string): string[];
