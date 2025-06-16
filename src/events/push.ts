import { Context } from "probot";
import { processCommits } from "../utils/todoProcessor.js";


/**
 * Handles the "push" event.
 *
 * This function is triggered when a push is made to the repository. It processes each commit to identify
 * TODOs comments in files and creates an issue for each TODO found.
 *
 * @param context - The Probot context object containing API access and event data.
 */
export default async function handlePush(context: Context) {
    const repo = context.repo();

    // Type guard to ensure payload has commits
    if (!Array.isArray((context.payload as any).commits)) {
        context.log.warn("Push event payload does not contain commits array.");
        return;
    }
    const commits = (context.payload as { commits: any[] }).commits;

    context.log.info(`Push received with ${commits.length} commits`);

    await processCommits(context, repo, commits);
}