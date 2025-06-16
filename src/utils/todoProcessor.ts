/**
 * Processes a list of commits to identify and handle TODO comments in files.
 *
 * This function iterates through each commit, retrieves the files that were added or modified,
 * and processes each file to find TODO comments. For each TODO found, it creates an issue in the
 * repository using the GitHub API.
 *
 * @param context - The Probot context object containing API access and event data.
 * @param repo - An object containing repository information (owner and repo name).
 * @param commits - An array of commit objects to process.
 */
export async function processCommits(context: any, repo: any, commits: any[]) {
    for (const commit of commits) {
        const files = [...(commit.added ?? []), ...(commit.modified ?? [])];
        context.log.info(`Commit ${commit.id} - files: ${files.join(", ")}`);

        await Promise.all(files.map(path =>
            processFile(context, repo, commit, path)
        ));
    }
}


/**
 * Processes a single file from a commit to identify and handle TODO comments.
 *
 * This function retrieves the content of a specified file from a repository
 * commit using the GitHub API, decodes it from base64, and splits it into
 * individual lines. It then calls `processTodosInFile` to handle any TODO
 * comments found within the file's content.
 *
 * @param context - The Probot context object containing API access and event data.
 * @param repo - An object containing repository information (owner and repo name).
 * @param commit - An object representing the commit information.
 * @param path - The path to the file within the repository.
 */

async function processFile(context: any, repo: any, commit: any, path: string) {
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

        await processTodosInFile(context, repo, commit, path, lines);
    } catch (error) {
        context.log.warn(`Failed to read ${path}: ${error}`);
    }
}


/**
 * Process a single file to find TODOs. It takes a context, repository
 * information, commit information, file path and file contents as parameters.
 *
 * The function iterates over each line in the file and checks if the line
 * contains a TODOs comment. If it does, it extracts the TODO message from the
 * line (if any) and creates a new issue using the GitHub API with the given
 * title, body and other information.
 *
 * The body of the issue is formatted as a code block with the line number and
 * path, and the TODO message as the content of the block. The commit hash is
 * also included in the issue body.
 *
 * If an error occurs during the creation of the issue, the function logs an
 * error message.
 */
async function processTodosInFile(
    context: any,
    repo: any,
    commit: any,
    path: string,
    lines: string[]
) {
    const todoIdentifier = "TODO:";

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];

        // Check if the line contains a TODOs comment
        if (line.includes(`// ${todoIdentifier}`)) {
            context.log.info(`TODO found at ${path}:${index + 1} - ${line.trim()}`);

            const todoMessage = extractTodoMessage(line);
            const issueTitle = todoMessage
                ? `${todoMessage} in ${path}`
                : `TODO found in ${path}`;

            await createIssueIfNotExists(
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


/**
 * Extracts the message from a TODO comment line.
 *
 * This function takes a string representing a line of code and extracts the 
 * message following a "TODO:" comment if it exists. It is case-insensitive 
 * and trims any whitespace from the extracted message.
 *
 * @param line - The line of code to extract the TODO message from.
 * @returns The extracted TODO message, or an empty string if no message is found.
 */

function extractTodoMessage(line: string): string {
    const todoMessageMatch = line.trim().match(/^\/\/ TODO:\s*(.*)/i);
    return todoMessageMatch ? todoMessageMatch[1].trim() : "";
}


/**
 * Creates a new issue for the given TODO if it doesn't already exist.
 *
 * The function takes the Probot context, repository information, issue title, path to the file, line of code
 * containing the TODO, line index and commit information as parameters.
 *
 * It first checks if an issue with the same title already exists using the GitHub API. If it does, the function
 * logs a message and exits. If not, it creates a new issue using the GitHub API with the given title, body and
 * other information.
 *
 * The body of the issue is formatted as a code block with the line number and path, and the TODO message as the
 * content of the block. The commit hash is also included in the issue body.
 *
 * If an error occurs during the creation of the issue, the function logs an error message.
 */
async function createIssueIfNotExists(
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
            context.log.info(`Issue already exists for: ${issueTitle}, skipping creation.`);
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
        context.log.error(`Error creating issue for ${path}: ${error}`);
    }
}