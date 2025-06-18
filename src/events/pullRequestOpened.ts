import { Context } from "probot";
import { ensureLabelsExist } from "../utils/labelManager.js";
import { isFirstPullRequest, postWelcomePrComment } from "./welcome.js";

/**
 * Handles the "pull_request.opened" event.
 *
 * This function is triggered when a new pull request is opened. It performs the following actions:
 * 1. Adds appropriate labels based on the PR title
 * 2. Checks if it's the user's first PR and posts a welcome message if it is
 *
 * @param context - The context object provided by Probot, containing information about the event.
 */
export default async function handlePullRequestOpened(context: Context) {
  // Auto-labeling
  if (!("pull_request" in context.payload) || !context.payload.pull_request?.title) {
    throw new Error("Payload does not contain pull request information.");
  }

  const title = context.payload.pull_request.title.toLowerCase();
  const labels = ["needs-review"];

  // Labels based on conventional commits format
  if (title.startsWith("fix") || title.includes("bug")) labels.push("bug");
  if (title.startsWith("feat") || title.includes("feature")) labels.push("enhancement");
  if (title.startsWith("docs")) labels.push("documentation");
  if (title.startsWith("chore")) labels.push("chore");
  if (title.startsWith("refactor")) labels.push("refactor");
  if (title.startsWith("test")) labels.push("test");

  // Vérifier si c'est la première pull request de l'utilisateur et ajouter le label "first-time"
  let isFirst = false;
  if (context.payload.pull_request.user) {
    const username = context.payload.pull_request.user.login;
    isFirst = await isFirstPullRequest(context, username);
    if (isFirst) {
      labels.push("first-time");
    }
  }

  await ensureLabelsExist(context, labels);

  await context.octokit.issues.addLabels({
    ...context.issue(),
    labels,
  });

  // Vérifier si c'est la première pull request de l'utilisateur et poster un message de bienvenue
  if (isFirst && context.payload.pull_request.user) {
    context.log.info(`Première pull request détectée pour l'utilisateur ${context.payload.pull_request.user.login}`);
    await postWelcomePrComment(context, context.payload.pull_request.number);
  }
}
