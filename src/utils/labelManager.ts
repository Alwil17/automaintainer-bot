/**
 * Label manager for GitHub issues and pull requests
 * Handles label detection and application
 */
import { Context } from 'probot';
import { issueLabels, prLabels, LabelConfig } from '../config/labelColors.js';

// Export a standalone function for ensuring labels exist
export async function ensureLabelsExist(
  context: Context, 
  labelNames: string[]
): Promise<void> {
  const labelManager = new LabelManager(context);
  await labelManager.ensureLabelsExist(labelNames);
}

export class LabelManager {
  private readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  /**
   * Apply appropriate labels to an issue based on its content
   * @param issueNumber The issue number
   * @param issueTitle The issue title
   * @param issueBody The issue body
   */
  async applyIssueLabels(issueNumber: number, issueTitle: string, issueBody: string): Promise<void> {
    const labelsToApply: string[] = [];
    const content = `${issueTitle} ${issueBody}`.toLowerCase();

    // Check for keywords in issue content
    for (const labelName of Object.keys(issueLabels)) {
      const keywords = this.getLabelKeywords(labelName);
      if (keywords.some(keyword => content.includes(keyword))) {
        labelsToApply.push(labelName);
      }
    }

    if (labelsToApply.length > 0) {
      await this.ensureLabelsExist(labelsToApply);
      await this.addLabels(issueNumber, labelsToApply);
    }
  }

  /**
   * Apply appropriate labels to a pull request based on its title
   * @param prNumber The pull request number
   * @param prTitle The pull request title
   */
  async applyPRLabels(prNumber: number, prTitle: string): Promise<void> {
    const labelsToApply: string[] = [];
    
    // Check for conventional commit prefixes in PR title
    // Format: type(scope): description
    const match = prTitle.match(/^(\w+)(?:\([\w-]+\))?:/);
    if (match && match[1] && prLabels[match[1]]) {
      labelsToApply.push(match[1]);
    }

    if (labelsToApply.length > 0) {
      await this.ensureLabelsExist(labelsToApply);
      await this.addLabels(prNumber, labelsToApply);
    }
  }

  /**
   * Ensure all required labels exist in the repository
   * @param labelNames Array of label names to ensure
   */
  async ensureLabelsExist(labelNames: string[]): Promise<void> {
    const repo = this.context.repo();
    const existingLabels = await this.getExistingLabels();
    const existingLabelNames = existingLabels.map(label => label.name);

    for (const labelName of labelNames) {
      if (!existingLabelNames.includes(labelName)) {
        const config = this.getLabelConfig(labelName);
        if (config) {
          try {
            await this.context.octokit.issues.createLabel({
              owner: repo.owner,
              repo: repo.repo,
              name: labelName,
              color: config.color,
              description: config.description,
            });
          } catch (error) {
            // Label might have been created in parallel
            this.context.log.warn(`Error creating label ${labelName}: ${error}`);
          }
        }
      }
    }
  }

  /**
   * Add specified labels to an issue or pull request
   * @param issueNumber The issue or PR number
   * @param labelNames Array of label names to add
   */
  private async addLabels(issueNumber: number, labelNames: string[]): Promise<void> {
    const repo = this.context.repo();
    try {
      await this.context.octokit.issues.addLabels({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: issueNumber,
        labels: labelNames,
      });
    } catch (error) {
      this.context.log.error(`Error adding labels to #${issueNumber}: ${error}`);
    }
  }

  /**
   * Get existing labels in the repository
   * @returns Array of labels
   */
  private async getExistingLabels(): Promise<Array<{name: string, color: string}>> {
    const repo = this.context.repo();
    try {
      const response = await this.context.octokit.issues.listLabelsForRepo({
        owner: repo.owner,
        repo: repo.repo,
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      this.context.log.error(`Error fetching repository labels: ${error}`);
      return [];
    }
  }

  /**
   * Get the appropriate label configuration by label name
   * @param labelName The name of the label to look up
   * @returns Label configuration with color and description
   */
  private getLabelConfig(labelName: string): LabelConfig | undefined {
    return issueLabels[labelName] || prLabels[labelName];
  }

  /**
   * Get keywords for a specific label
   * @param labelName The name of the label
   * @returns Array of keywords associated with the label
   */
  private getLabelKeywords(labelName: string): string[] {
    // Basic implementation - can be extended for more sophisticated mapping
    const keywordMap: {[key: string]: string[]} = {
      bug: ['bug', 'error', 'fail', 'issue', 'fix', 'broken'],
      enhancement: ['enhancement', 'improve', 'improvement'],
      feature: ['feature', 'request', 'add'],
      documentation: ['documentation', 'docs', 'document'],
      question: ['question', 'help', 'how to', '?'],
      'good first issue': ['beginner', 'easy', 'starter'],
      help: ['help wanted', 'assistance', 'need help'],
    };
    
    return keywordMap[labelName] || [labelName];
  }
}