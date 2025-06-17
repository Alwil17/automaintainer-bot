import crypto from "crypto";

const todoIdentifier = "TODO:";

/**
 * Generates a SHA-1 hash for a TODO comment.
 *
 * This function creates a unique identifier for a TODO comment based on its
 * file path and content. The hash can be used to track or compare TODOs.
 *
 * @param path - The file path where the TODO comment is located.
 * @param todoContent - The content of the TODO comment.
 * @returns A SHA-1 hash string representing the TODO's unique identifier.
 */

function generateTodoHash(path: string, todoContent: string): string {
    const data = `${path}:${todoContent.trim()}`;
    return crypto.createHash("sha1").update(data).digest("hex");
}

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

        await processTodosInFile(context, repo, commit, path, lines, decoded);
    } catch (error) {
        context.log.warn(`Failed to read ${path}: ${error}`);
    }
}

/**
 * Process a single file to find TODOs. It takes a context, repository
 * information, commit information, file path and file contents as parameters.
 *
 * The function processes:
 * 1. Single-line TODOs
 * 2. Block comment TODOs
 * 3. Multi-line TODOs
 *
 * The function creates issues for each unique TODO found.
 */
async function processTodosInFile(
    context: any,
    repo: any,
    commit: any,
    path: string,
    lines: string[],
    fileContent: string
) {
    const todoBlockPattern = /\/\*\s*TODO:([^*]*)\*\//g;
    
    // Process single-line TODOs
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        
        // Check if the line contains a inline TODO comment
        if (line.includes(`// ${todoIdentifier}`)) {
            context.log.info(`Single-line TODO found at ${path}:${index + 1} - ${line.trim()}`);
            
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
    
    // Process block comment TODOs
    let blockMatch;
    while ((blockMatch = todoBlockPattern.exec(fileContent)) !== null) {
        const fullMatch = blockMatch[0];
        const todoContent = blockMatch[1].trim();
        
        // Find line number by counting newlines before the match position
        const contentBeforeMatch = fileContent.substring(0, blockMatch.index);
        const lineNumber = contentBeforeMatch.split('\n').length;
        
        context.log.info(`Block comment TODO found at ${path}:${lineNumber} - ${todoContent}`);
        
        const todoMessage = todoContent.split('\n')[0].trim();
        const issueTitle = todoMessage
            ? `${todoMessage} in ${path}`
            : `TODO found in ${path}`;
        
        await createIssueIfNotExists(
            context,
            repo,
            issueTitle,
            path,
            fullMatch,
            lineNumber - 1,
            commit,
            true
        );
    }
    
    // Process multi-line TODOs (continuing lines after a TODO:)
    let inMultiLineTodo = false;
    let multiLineTodoStart = -1;
    let multiLineTodoContent = "";
    
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index].trim();
        
        if (!inMultiLineTodo && line.includes(`// ${todoIdentifier}`)) {
            // Start of a potential multi-line TODO
            inMultiLineTodo = true;
            multiLineTodoStart = index;
            multiLineTodoContent = line;
        } else if (inMultiLineTodo) {
            // Check if this line is a continuation of the TODO
            if (line.startsWith("//") && !line.includes("TODO:")) {
                // This is a continuation line
                multiLineTodoContent += "\n" + line;
            } else {
                // End of multi-line TODO or not a continuation
                inMultiLineTodo = false;
                
                // Only process as multi-line if we actually collected multiple lines
                if (multiLineTodoContent.includes("\n")) {
                    context.log.info(`Multi-line TODO found at ${path}:${multiLineTodoStart + 1}`);
                    
                    const firstLine = multiLineTodoContent.split("\n")[0];
                    const todoMessage = extractTodoMessage(firstLine);
                    const issueTitle = todoMessage
                        ? `${todoMessage} in ${path}`
                        : `TODO found in ${path}`;
                    
                    await createIssueIfNotExists(
                        context,
                        repo,
                        issueTitle,
                        path,
                        multiLineTodoContent,
                        multiLineTodoStart,
                        commit,
                        true
                    );
                }
                
                // Check if this line itself starts a new TODO
                if (line.includes(`// ${todoIdentifier}`)) {
                    inMultiLineTodo = true;
                    multiLineTodoStart = index;
                    multiLineTodoContent = line;
                }
            }
        }
    }
    
    // Handle case where file ends with a multi-line TODO
    if (inMultiLineTodo && multiLineTodoContent.includes("\n")) {
        context.log.info(`Multi-line TODO found at end of ${path}:${multiLineTodoStart + 1}`);
        
        const firstLine = multiLineTodoContent.split("\n")[0];
        const todoMessage = extractTodoMessage(firstLine);
        const issueTitle = todoMessage
            ? `${todoMessage} in ${path}`
            : `TODO found in ${path}`;
        
        await createIssueIfNotExists(
            context,
            repo,
            issueTitle,
            path,
            multiLineTodoContent,
            multiLineTodoStart,
            commit,
            true
        );
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
 * @param context - The Probot context
 * @param repo - Repository information
 * @param issueTitle - Title for the issue
 * @param path - File path where the TODO was found
 * @param todoContent - Content of the TODO comment
 * @param lineIndex - Line number where the TODO starts
 * @param commit - Commit information
 * @param isMultiLine - Whether this is a multi-line TODO
 */
async function createIssueIfNotExists(
    context: any,
    repo: any,
    issueTitle: string,
    path: string,
    todoContent: string,
    lineIndex: number,
    commit: any,
    isMultiLine: boolean = false
) {
    try {
        const todoHash = generateTodoHash(path, todoContent);
        // Check if an issue with this title already exists
        const { data: issues } = await context.octokit.issues.listForRepo({
            owner: repo.owner,
            repo: repo.repo,
            state: "open", // Check only open issues
            per_page: 100,
            // Search by title using filter on client side since API doesn't provide title filter
        });

        // Generate a unique hash for the TODO to check if it already exists
        const issueExists = issues.some((issue: { body?: string }) =>
            issue.body?.includes(`<!-- todo-hash: ${todoHash} -->`)
        );

        if (issueExists) {
            context.log.info(`TODO already exists via hash: ${todoHash}, skipping.`);
            return;
        }

        // Format the todo content for display
        const formattedTodo = isMultiLine 
            ? "```\n" + todoContent + "\n```"
            : "`" + todoContent.trim() + "`";

        // Create issue body with unique identifier
        const body = `**Line ${lineIndex + 1}** of \`${path}\`:\n\n${formattedTodo}\n\n_Commit: ${commit.id}_\n\n<!-- todo-hash: ${todoHash} -->`;

        // Create the issue if it doesn't exist
        await context.octokit.issues.create({
            owner: repo.owner,
            repo: repo.repo,
            title: issueTitle,
            body: body,
        });
    } catch (error) {
        context.log.error(`Error creating issue for ${path}: ${error}`);
    }
}