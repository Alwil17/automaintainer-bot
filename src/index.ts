import { Probot } from "probot";

export default (app: Probot) => {
  app.log.info("Yay, my app is loaded");
  // This will run when the issue is opened.
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
            ref: commit.id,
          });

          if (!("content" in res.data)) continue;

          const decoded = Buffer.from(res.data.content, "base64").toString("utf-8");
          const lines = decoded.split("\n");

          for (let index = 0; index < lines.length; index++) {
            const line = lines[index];
            if (line.includes("// TODO:") || line.includes("// TODO: ")) {
              app.log.info(`TODO found at ${path}:${index + 1} - ${line.trim()}`);

              // Extract the TODO message after "TODO"
              const todoMessageMatch = line.match(/^\/\/ TODO:(.*)/i);
              const todoMessage = todoMessageMatch ? todoMessageMatch[1].trim() : "";

              const issueTitle = todoMessage
                ? `${todoMessage} in ${path}`
                : `TODO found in ${path}`;

              // Check if an issue with this title already exists (open or closed)
              const { data: issues } = await context.octokit.issues.listForRepo({
                owner: repo.owner,
                repo: repo.repo,
                state: "all",
                per_page: 100,
                // Search by title using filter on client side since API doesn't provide title filter
              });

              const issueExists = issues.some(issue => issue.title === issueTitle);

              if (issueExists) {
                app.log.info(`Issue already exists for: ${issueTitle}, skipping creation.`);
                continue;
              }

              // Create the issue if it doesn't exist
              await context.octokit.issues.create({
                owner: repo.owner,
                repo: repo.repo,
                title: issueTitle,
                body: `**Line ${index + 1}** of \`${path}\`:\n\n\`${line.trim()}\`\n\n_Commit: ${commit.id}_`,
              });
            }
          }
        } catch (error) {
          app.log.warn(`Failed to read ${path}: ${error}`);
        }
      }
    }
  });
};
