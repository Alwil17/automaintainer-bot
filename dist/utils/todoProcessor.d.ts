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
export declare function processCommits(context: any, repo: any, commits: any[]): Promise<void>;
