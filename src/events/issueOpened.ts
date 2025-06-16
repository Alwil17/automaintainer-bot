import { Context } from "probot";
import { ensureLabelsExist } from "../utils/labelManager.js";

/**
 * Handles the "issues.opened" event.
 * 
 * This function is triggered when a new issue is opened. It performs the following actions:
 * 1. Posts a thank you comment on the newly opened issue.
 * 2. Analyzes the issue title to determine appropriate labels to add, such as "triage", "bug", or "enhancement".
 * 3. Ensures that the determined labels exist in the repository, creating them if necessary.
 * 4. Adds the labels to the issue.
 * 
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default async function handleIssuesOpened(context: Context) {
  const issueComment = context.issue({
    body: "Thanks for opening this issue!",
  });

  await context.octokit.issues.createComment(issueComment);

  // Auto-labeling
  if (!("issue" in context.payload) || !context.payload.issue?.title) {
    throw new Error("Payload does not contain issue information.");
  }
  const title = context.payload.issue.title.toLowerCase();
  const labels = ["triage"];

  if (title.includes("bug")) labels.push("bug");
  if (title.includes("feature") || title.includes("enhancement")) labels.push("enhancement");

  await ensureLabelsExist(context, labels);

  await context.octokit.issues.addLabels({
    ...context.issue(),
    labels,
  });
}