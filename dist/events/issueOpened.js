import { ensureLabelsExist } from "../utils/labelManager.js";
import { isFirstIssue, postWelcomeComment } from "./welcome.js";
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
export default async function handleIssuesOpened(context) {
    const issueComment = context.issue({
        body: "Thanks for opening this issue!\nThis issue was created automatically based on a TODO found in code.",
    });
    await context.octokit.issues.createComment(issueComment);
    // Auto-labeling
    if (!("issue" in context.payload) || !context.payload.issue?.title) {
        throw new Error("Payload does not contain issue information.");
    }
    const title = context.payload.issue.title.toLowerCase();
    const body = context.payload.issue.body?.toLowerCase() || "";
    const labels = ["needs-triage"];
    if (title.includes("bug"))
        labels.push("bug");
    if (title.includes("feature") || title.includes("enhancement"))
        labels.push("enhancement");
    // Ajout du label "good first issue" si le titre ou le corps contient cette mention
    if (title.includes("good first issue") || body.includes("good first issue"))
        labels.push("good first issue");
    // Vérifier si c'est le premier issue de l'utilisateur et ajouter le label "first-time"
    let isFirst = false;
    if (context.payload.issue.user) {
        const username = context.payload.issue.user.login;
        isFirst = await isFirstIssue(context, username);
        if (isFirst) {
            labels.push("first-time");
        }
    }
    await ensureLabelsExist(context, labels);
    await context.octokit.issues.addLabels({
        ...context.issue(),
        labels,
    });
    // Vérifier si c'est le premier issue de l'utilisateur et poster un message de bienvenue
    if (isFirst && context.payload.issue.user) {
        context.log.info(`Premier issue détecté pour l'utilisateur ${context.payload.issue.user.login}`);
        await postWelcomeComment(context, context.payload.issue.number);
    }
}
//# sourceMappingURL=issueOpened.js.map