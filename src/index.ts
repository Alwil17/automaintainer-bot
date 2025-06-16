import { Probot } from "probot";

export default (app: Probot) => {
  // This will run when the app is installed
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });
  // TODO: Gestion des TODO à chaque push
};
