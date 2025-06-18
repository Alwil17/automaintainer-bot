import { Context } from "probot";
/**
 * Handles the "marketplace_purchase" event.
 *
 * This function is triggered when a marketplace purchase event occurs.
 * It handles different actions such as purchased, cancelled, changed, or pending_change.
 *
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default function handleMarketplacePurchase(context: Context<"marketplace_purchase">): Promise<void>;
