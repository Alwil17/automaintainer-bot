import { Probot } from "probot";

export default (app: Probot) => {
  app.log.info("Yay, my app is loaded");
  // This will run when the issue is opened
  // and will create a comment on the issue
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);
  });
  // TODO: refactor this method
  // This will run when a push event occurs
  // and will create an issue for each TODO found in the pushed files
  app.on("push", async (context) => {
    const repo = context.repo();
    const commits = context.payload.commits;

    app.log.info(`Push received with ${commits.length} commits`);

    for (const commit of commits) {
      const files = [...(commit.added || []), ...(commit.modified || [])];
      app.log.info(`Commit ${commit.id} - files: ${files.join(", ")}`);

      for (const path of files) {
        try {
          const res = await context.octokit.repos.getContent({
            owner: repo.owner,
            repo: repo.repo,
            path,
            ref: commit.id, // read the file at the specific commit
          });

          if (!("content" in res.data)) continue;

          const decoded = Buffer.from(res.data.content, "base64").toString("utf-8");
          const lines = decoded.split("\n");

          lines.forEach(async (line, index) => {
            if (line.includes("TODO")) {
              app.log.info(`TODO found at ${path}:${index + 1} - ${line.trim()}`);

              await context.octokit.issues.create({
                owner: repo.owner,
                repo: repo.repo,
                title: `TODO found in ${path}`,
                body: `**Line ${index + 1}** of \`${path}\`:\n\n\`${line.trim()}\`\n\n_Commit: ${commit.id}_`,
              });
            }
          });
        } catch (error) {
          app.log.warn(`Failed to read ${path}: ${error}`);
        }
      }
    }
  });

  // TODO: Add more event handlers as needed
};
