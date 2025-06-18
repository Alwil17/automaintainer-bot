import { Context } from "probot";
import { loadMarketplaceConfig } from "../utils/marketplaceConfig.js";
/**
 * Handles the "marketplace_purchase" event.
 * 
 * This function is triggered when a marketplace purchase event occurs.
 * It handles different actions such as purchased, cancelled, changed, or pending_change.
 * 
 * @param context - The context object provided by Probot, containing information about the event.
 */

export default async function handleMarketplacePurchase(
  context: Context<"marketplace_purchase">
) {
  const payload = context.payload;
  const action = payload.action;
  const marketplace_purchase = payload.marketplace_purchase;
  const sender = payload.sender;

  context.log.info(`Marketplace purchase event received: ${action} by ${sender.login}`);
  
  // Load marketplace configuration
  const config = await loadMarketplaceConfig(context);
  
  switch (action) {
    case "purchased":
      await handlePurchased(context, marketplace_purchase, config);
      break;
    case "cancelled":
      await handleCancelled(context, marketplace_purchase, config);
      break;
    case "changed":
      await handleChanged(context, marketplace_purchase, config);
      break;
    case "pending_change":
      await handlePendingChange(context, marketplace_purchase, config);
      break;
    default:
      context.log.warn(`Unknown marketplace action: ${action}`);
  }
}

/**
 * Handles a new purchase of the app.
 */
async function handlePurchased(context: Context, purchase: any, config: any): Promise<void> {
  // Get the plan details
  const planName = purchase.plan.name;
  const planId = purchase.plan.id;
  const accountId = purchase.account.id;
  const accountLogin = purchase.account.login;
  
  context.log.info(`New purchase: ${accountLogin} (${accountId}) purchased ${planName} (${planId})`);
  
  try {
    // Record the purchase in your system
    // This could involve adding the account to a database or updating permissions
    
    // If this is an organization, get a list of repositories to enable the app for
    if (purchase.account.type === "Organization") {
      const repos = await context.octokit.apps.listReposAccessibleToInstallation();
      context.log.info(`Enabling app for ${repos.data.repositories.length} repositories`);
      
      // Process each repository as needed
      for (const repo of repos.data.repositories) {
        context.log.info(`Processing repository: ${repo.full_name}`);
        // Initialize repository-specific configuration
      }
    }
    
    // Send welcome message or notification if appropriate
    if (config.sendWelcomeMessage && purchase.account.type === "User") {
      await context.octokit.issues.create({
        owner: accountLogin,
        repo: ".github", // Special repository for profile README
        title: "Welcome to AutoMaintainer!",
        body: getWelcomeMessage(purchase.plan.name),
      }).catch(err => {
        // Repository might not exist or be accessible
        context.log.warn(`Could not create welcome issue: ${err.message}`);
      });
    }
  } catch (error) {
    context.log.error(`Error handling purchase: ${error}`);
  }
}

/**
 * Handles cancellation of a subscription.
 */
async function handleCancelled(context: Context, purchase: any, config: any): Promise<void> {
  const accountId = purchase.account.id;
  const accountLogin = purchase.account.login;
  
  context.log.info(`Subscription cancelled for: ${accountLogin} (${accountId})`);
  
  try {
    // Update your records to reflect the cancellation
    // You might want to retain data for a grace period
    
    // Send feedback request if configured
    if (config.sendCancellationSurvey) {
      await context.octokit.issues.create({
        owner: accountLogin,
        repo: ".github", // Special repository for profile README
        title: "Feedback on AutoMaintainer",
        body: getCancellationMessage(),
      }).catch(err => {
        context.log.warn(`Could not create feedback issue: ${err.message}`);
      });
    }
  } catch (error) {
    context.log.error(`Error handling cancellation: ${error}`);
  }
}

/**
 * Handles a change to an existing subscription (e.g., plan upgrade/downgrade).
 */
async function handleChanged(context: Context, purchase: any, config: any): Promise<void> {
  const accountId = purchase.account.id;
  const accountLogin = purchase.account.login;
  const newPlan = purchase.plan.name;
  
  context.log.info(`Subscription changed for: ${accountLogin} (${accountId}) to ${newPlan}`);
  
  try {
    // Update your records with the new plan details
    
    // If upgrading, enable additional features
    // If downgrading, gracefully handle feature removal
    
    // Notify the user of changes if configured
    if (config.notifyOnPlanChange) {
      await context.octokit.issues.create({
        owner: accountLogin,
        repo: ".github", // Special repository for profile README
        title: "Your AutoMaintainer subscription has changed",
        body: getPlanChangeMessage(newPlan),
      }).catch(err => {
        context.log.warn(`Could not create plan change notification: ${err.message}`);
      });
    }
  } catch (error) {
    context.log.error(`Error handling subscription change: ${error}`);
  }
}

/**
 * Handles a pending change to a subscription.
 */
async function handlePendingChange(context: Context, purchase: any, config: any): Promise<void> {
  const accountId = purchase.account.id;
  const accountLogin = purchase.account.login;
  const pendingPlan = purchase.plan.name;
  
  context.log.info(`Pending change for: ${accountLogin} (${accountId}) to ${pendingPlan}`);
  
  // No action needed here typically as this is just a notification
  // You could log or prepare for the upcoming change
}

/**
 * Generate welcome message based on plan.
 */
function getWelcomeMessage(planName: string): string {
  return `# Welcome to AutoMaintainer!

Thank you for subscribing to the ${planName} plan. We're excited to help you maintain your repositories!

## Getting Started

1. The app is now monitoring your repositories for TODOs in code and will create issues for them.
2. You can customize the app's behavior by adding a \`.github/auto-maintainer.yml\` file to your repositories.

## Need help?

- Check our [documentation](https://github.com/your-org/automaintainer/wiki)
- Open an issue in our [support repository](https://github.com/your-org/automaintainer/issues)

Thank you for using AutoMaintainer!`;
}

/**
 * Generate cancellation feedback request.
 */
function getCancellationMessage(): string {
  return `# We're sorry to see you go!

We noticed you've cancelled your AutoMaintainer subscription. We'd love to hear your feedback to help us improve.

## Quick feedback

What was the main reason you cancelled?
- [ ] Too expensive
- [ ] Missing features
- [ ] Difficult to use
- [ ] Found an alternative
- [ ] Other (please explain below)

Any other comments or suggestions?

Thank you for trying AutoMaintainer!`;
}

/**
 * Generate plan change message.
 */
function getPlanChangeMessage(newPlanName: string): string {
  return `# Your subscription has changed

Your AutoMaintainer subscription has been updated to the **${newPlanName}** plan.

## What's Next?

The changes to your subscription will take effect immediately. If you've upgraded, you'll now have access to additional features. If you've downgraded, some features may no longer be available.

If you have any questions about your subscription, please open an issue in our [support repository](https://github.com/your-org/automaintainer/issues).

Thank you for using AutoMaintainer!`;
}
