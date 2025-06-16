import { Probot } from "probot";

const labelColors: Record<string, string> = {
  bug: "d73a4a",
  enhancement: "a2eeef",
  feature: "0e8a16",
  refactor: "cfd3d7",
  chore: "eeeeee",
  documentation: "0075ca",
  triage: "fbca04",
};

async function ensureLabelExists(context: any, label: string) {
  const { owner, repo } = context.repo();

  try {
    await context.octokit.issues.getLabel({
      owner,
      repo,
      name: label,
    });
  } catch (error: any) {
    if (error.status === 404) {
      await context.octokit.issues.createLabel({
        owner,
        repo,
        name: label,
        color: labelColors[label] || "ededed", // default if unknown
        description: `Auto-generated label: ${label}`,
      });
    } else {
      throw error;
    }
  }
}


export default (app: Probot) => {
  app.log.info("Yay, my app is loaded");

  // This will run when the issue is opened.
  // and will create a comment on the issue
  app.on("issues.opened", async (context) => {
    const issueComment = context.issue({
      body: "Thanks for opening this issue!",
    });
    await context.octokit.issues.createComment(issueComment);

    // Auto-labeling
    const title = context.payload.issue.title.toLowerCase();

    const labelsToAdd: string[] = ["triage"];

    if (title.includes("bug")) {
      labelsToAdd.push("bug");
    }
    if (title.includes("feature") || title.includes("enhancement")) {
      labelsToAdd.push("enhancement");
    }

    if (labelsToAdd.length > 0) {
      for (const label of labelsToAdd) {
        await ensureLabelExists(context, label); // Ensure label exists before applying
      }
      await context.octokit.issues.addLabels({
        ...context.issue(),
        labels: labelsToAdd,
      });
    }
  });

  // This will run when a push event occurs
  // and will create an issue for each TODO found in the pushed files
  app.on("push", async (context) => {
    const repo = context.repo();
    const commits = context.payload.commits;

    app.log.info(`Push received with ${commits.length} commits`);

    try {
      await processCommits(app, context, repo, commits);
    } catch (error) {
      app.log.error(`Error processing push event: ${error}`);
    }
  });

  // This will run when a pull request is opened
  // and will add labels to the pull request
  app.on("pull_request.opened", async (context) => {
    const prTitle = context.payload.pull_request.title.toLowerCase();
    const labelsToAdd: string[] = [];

    if (prTitle.includes("chore")) labelsToAdd.push("chore");
    if (prTitle.includes("docs")) labelsToAdd.push("documentation");
    if (prTitle.includes("refactor")) labelsToAdd.push("refactor");

    if (labelsToAdd.length > 0) {
      for (const label of labelsToAdd) {
        await ensureLabelExists(context, label); // Ensure label exists before applying
      }

      await context.octokit.issues.addLabels({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        issue_number: context.payload.pull_request.number,
        labels: labelsToAdd,
      });
    }
  });

  // Process each commit in a push event
  async function processCommits(app: Probot, context: any, repo: any, commits: any[]) {
    for (const commit of commits) {
      const files = [...(commit.added || []), ...(commit.modified || [])];
      app.log.info(`Commit ${commit.id} - files: ${files.join(", ")}`);

      await Promise.all(files.map(path =>
        processFile(app, context, repo, commit, path)
      ));
    }
  }

  // Process a single file to find TODOs
  async function processFile(app: Probot, context: any, repo: any, commit: any, path: string) {
    try {
      const res = await context.octokit.repos.getContent({
        owner: repo.owner,
        repo: repo.repo,
        path,
        ref: commit.id,
      });

      if (!("content" in res.data)) return;

      const decoded = Buffer.from(res.data.content, "base64").toString("utf-8");
      const lines = decoded.split("\n");

      await processTodosInFile(app, context, repo, commit, path, lines);
    } catch (error) {
      app.log.warn(`Failed to read ${path}: ${error}`);
    }
  }

  // Find and process TODOs in a file's content
  async function processTodosInFile(
    app: Probot,
    context: any,
    repo: any,
    commit: any,
    path: string,
    lines: string[]
  ) {
    const todoIdentifier = "TODO:";

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];

      // Check if the line contains a TODO comment
      if (line.includes(`// ${todoIdentifier}`)) {
        app.log.info(`TODO found at ${path}:${index + 1} - ${line.trim()}`);

        const todoMessage = extractTodoMessage(line);
        const issueTitle = todoMessage
          ? `${todoMessage} in ${path}`
          : `TODO found in ${path}`;

        await createIssueIfNotExists(
          app,
          context,
          repo,
          issueTitle,
          path,
          line,
          index,
          commit
        );
      }
    }
  }

  // Extract the TODO message from a comment line
  function extractTodoMessage(line: string): string {
    const todoMessageMatch = line.trim().match(/^\/\/ TODO:\s*(.*)/i);
    return todoMessageMatch ? todoMessageMatch[1].trim() : "";
  }

  // Create a GitHub issue for a TODO if one doesn't already exist
  async function createIssueIfNotExists(
    app: Probot,
    context: any,
    repo: any,
    issueTitle: string,
    path: string,
    line: string,
    lineIndex: number,
    commit: any
  ) {
    try {
      // Check if an issue with this title already exists
      const { data: issues } = await context.octokit.issues.listForRepo({
        owner: repo.owner,
        repo: repo.repo,
        state: "open", // Check only open issues
        per_page: 100,
        // Search by title using filter on client side since API doesn't provide title filter
      });

      const issueExists = issues.some((issue: { title: string; }) => issue.title === issueTitle);

      if (issueExists) {
        app.log.info(`Issue already exists for: ${issueTitle}, skipping creation.`);
        return;
      }

      // Create the issue if it doesn't exist
      await context.octokit.issues.create({
        owner: repo.owner,
        repo: repo.repo,
        title: issueTitle,
        body: `**Line ${lineIndex + 1}** of \`${path}\`:\n\n\`${line.trim()}\`\n\n_Commit: ${commit.id}_`,
      });
    } catch (error) {
      app.log.error(`Error creating issue for ${path}: ${error}`);
    }
  }
};
