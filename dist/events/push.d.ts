import { Context } from "probot";
/**
 * Handles the "push" event.
 *
 * This function is triggered when a push is made to the repository. It processes each commit to identify
 * TODOs comments in files and creates an issue for each TODO found.
 *
 * @param context - The Probot context object containing API access and event data.
 */
export default function handlePush(context: Context): Promise<void>;
