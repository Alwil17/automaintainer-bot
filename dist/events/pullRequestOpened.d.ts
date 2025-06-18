import { Context } from "probot";
/**
 * Handles the "pull_request.opened" event.
 *
 * This function is triggered when a new pull request is opened. It performs the following actions:
 * 1. Adds appropriate labels based on the PR title
 * 2. Checks if it's the user's first PR and posts a welcome message if it is
 *
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default function handlePullRequestOpened(context: Context): Promise<void>;
