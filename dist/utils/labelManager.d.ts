/**
 * Label manager for GitHub issues and pull requests
 * Handles label detection and application
 */
import { Context } from 'probot';
export declare function ensureLabelsExist(context: Context, labelNames: string[]): Promise<void>;
export declare class LabelManager {
    private readonly context;
    constructor(context: Context);
    /**
     * Apply appropriate labels to an issue based on its content
     * @param issueNumber The issue number
     * @param issueTitle The issue title
     * @param issueBody The issue body
     */
    applyIssueLabels(issueNumber: number, issueTitle: string, issueBody: string): Promise<void>;
    /**
     * Apply appropriate labels to a pull request based on its title
     * @param prNumber The pull request number
     * @param prTitle The pull request title
     */
    applyPRLabels(prNumber: number, prTitle: string): Promise<void>;
    /**
     * Ensure all required labels exist in the repository
     * @param labelNames Array of label names to ensure
     */
    ensureLabelsExist(labelNames: string[]): Promise<void>;
    /**
     * Add specified labels to an issue or pull request
     * @param issueNumber The issue or PR number
     * @param labelNames Array of label names to add
     */
    private addLabels;
    /**
     * Get existing labels in the repository
     * @returns Array of labels
     */
    private getExistingLabels;
    /**
     * Get the appropriate label configuration by label name
     * @param labelName The name of the label to look up
     * @returns Label configuration with color and description
     */
    private getLabelConfig;
    /**
     * Get keywords for a specific label
     * @param labelName The name of the label
     * @returns Array of keywords associated with the label
     */
    private getLabelKeywords;
}
