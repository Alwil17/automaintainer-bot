// Default configuration for marketplace interactions
const defaultMarketplaceConfig = {
    sendWelcomeMessage: true,
    sendCancellationSurvey: true,
    notifyOnPlanChange: true,
    freeTierFeatures: [
        "todo-detection",
        "basic-labels"
    ],
    proPlanFeatures: [
        "todo-detection",
        "basic-labels",
        "advanced-labels",
        "custom-todo-markers"
    ],
    teamPlanFeatures: [
        "todo-detection",
        "basic-labels",
        "advanced-labels",
        "custom-todo-markers",
        "custom-issue-templates"
    ],
    enterprisePlanFeatures: [
        "todo-detection",
        "basic-labels",
        "advanced-labels",
        "custom-todo-markers",
        "custom-issue-templates",
        "priority-support",
        "custom-workflows"
    ]
};
/**
 * Loads marketplace configuration from environment or default values
 *
 * @param context - The Probot context
 * @returns The marketplace configuration
 */
export async function loadMarketplaceConfig(context) {
    try {
        // In a real implementation, you might load this from a database or service
        // Here we're using environment variables or defaults
        return {
            ...defaultMarketplaceConfig,
            sendWelcomeMessage: process.env.SEND_WELCOME_MESSAGE !== "false",
            sendCancellationSurvey: process.env.SEND_CANCELLATION_SURVEY !== "false",
            notifyOnPlanChange: process.env.NOTIFY_ON_PLAN_CHANGE !== "false"
        };
    }
    catch (error) {
        context.log.warn("Error loading marketplace config, using defaults", error);
        return defaultMarketplaceConfig;
    }
}
/**
 * Determines if a feature is available for a given plan
 *
 * @param feature The feature to check
 * @param planName The name of the plan
 * @returns True if the feature is available in the plan
 */
export function isFeatureAvailable(feature, planName) {
    const lowerPlanName = planName.toLowerCase();
    // Get the appropriate feature list based on plan name
    let featureList = defaultMarketplaceConfig.freeTierFeatures;
    if (lowerPlanName.includes("pro")) {
        featureList = defaultMarketplaceConfig.proPlanFeatures;
    }
    else if (lowerPlanName.includes("team")) {
        featureList = defaultMarketplaceConfig.teamPlanFeatures;
    }
    else if (lowerPlanName.includes("enterprise")) {
        featureList = defaultMarketplaceConfig.enterprisePlanFeatures;
    }
    return featureList.includes(feature);
}
/**
 * Gets the list of features available for a plan
 *
 * @param planName The name of the plan
 * @returns Array of available features
 */
export function getAvailableFeatures(planName) {
    const lowerPlanName = planName.toLowerCase();
    if (lowerPlanName.includes("enterprise")) {
        return defaultMarketplaceConfig.enterprisePlanFeatures;
    }
    else if (lowerPlanName.includes("team")) {
        return defaultMarketplaceConfig.teamPlanFeatures;
    }
    else if (lowerPlanName.includes("pro")) {
        return defaultMarketplaceConfig.proPlanFeatures;
    }
    else {
        return defaultMarketplaceConfig.freeTierFeatures;
    }
}
//# sourceMappingURL=marketplaceConfig.js.map