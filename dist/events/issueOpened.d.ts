import { Context } from "probot";
/**
 * Handles the "issues.opened" event.
 *
 * This function is triggered when a new issue is opened. It performs the following actions:
 * 1. Posts a thank you comment on the newly opened issue.
 * 2. Analyzes the issue title to determine appropriate labels to add, such as "triage", "bug", or "enhancement".
 * 3. Ensures that the determined labels exist in the repository, creating them if necessary.
 * 4. Adds the labels to the issue.
 * 5. Checks if it's the user's first issue and posts a welcome message if it is.
 *
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default function handleIssuesOpened(context: Context): Promise<void>;
