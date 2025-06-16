import { Context } from "probot";
import { ensureLabelsExist } from "../utils/labelManager.js";


/**
 * Handles the "pull_request.opened" event.
 *
 * This function is triggered when a pull request is opened. It performs the following actions:
 *
 * 1. Posts a thank you comment on the newly opened pull request.
 * 2. Analyzes the pull request title to determine appropriate labels to add, such as "triage", "bug", or "enhancement".
 * 3. Ensures that the determined labels exist in the repository, creating them if necessary.
 * 4. Adds the labels to the pull request.
 *
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default async function handlePullRequestOpened(context: Context) {

    if (!("pull_request" in context.payload) || !context.payload.pull_request) {
        throw new Error("Payload does not contain pull_request");
    }

    const prTitle = context.payload.pull_request.title.toLowerCase();
    const labels: string[] = [];

    if (prTitle.includes("chore")) labels.push("chore");
    if (prTitle.includes("docs")) labels.push("documentation");
    if (prTitle.includes("refactor")) labels.push("refactor");

    await ensureLabelsExist(context, labels);

    await context.octokit.issues.addLabels({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.pull_request.number,
        labels: labels,
    });
}
