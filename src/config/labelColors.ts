/**
 * Label configuration for the AutoMaintainer app
 * Contains color definitions and descriptions for issue and PR labels
 */

export interface LabelConfig {
  color: string;
  description: string;
}

export interface LabelDefinitions {
  [key: string]: LabelConfig;
}

// Issue type labels based on common conventions
export const issueLabels: LabelDefinitions = {
  bug: {
    color: 'd73a4a',
    description: 'Something isn\'t working as expected',
  },
  enhancement: {
    color: 'a2eeef',
    description: 'New feature or request',
  },
  feature: {
    color: '0075ca',
    description: 'New functionality to be added',
  },
  documentation: {
    color: '0075ca',
    description: 'Improvements or additions to documentation',
  },
  question: {
    color: 'd876e3',
    description: 'Further information is requested',
  },
  'good first issue': {
    color: '7057ff',
    description: 'Good for newcomers to the project',
  },
  help: {
    color: '008672',
    description: 'Extra attention is needed',
  },
};

// PR type labels based on conventional commits
export const prLabels: LabelDefinitions = {
  feat: {
    color: '0e8a16',
    description: 'New feature',
  },
  fix: {
    color: 'd73a4a',
    description: 'Bug fix',
  },
  docs: {
    color: '0075ca',
    description: 'Documentation changes',
  },
  style: {
    color: 'fbca04',
    description: 'Changes that do not affect the meaning of the code',
  },
  refactor: {
    color: '1d76db',
    description: 'Code change that neither fixes a bug nor adds a feature',
  },
  perf: {
    color: '5319e7',
    description: 'Code change that improves performance',
  },
  test: {
    color: 'c2e0c6',
    description: 'Adding missing tests or correcting existing tests',
  },
  chore: {
    color: 'bfd4f2',
    description: 'Changes to the build process or auxiliary tools',
  },
};

/**
 * Get the appropriate label configuration by label name
 * @param labelName The name of the label to look up
 * @returns Label configuration with color and description
 */
export function getLabelConfig(labelName: string): LabelConfig | undefined {
  return issueLabels[labelName] || prLabels[labelName];
}

/**
 * Get a combined list of all label names
 * @returns Array of all defined label names
 */
export function getAllLabelNames(): string[] {
  return [...Object.keys(issueLabels), ...Object.keys(prLabels)];
}

/**
 * Check if a label exists in our definitions
 * @param labelName The name of the label to check
 * @returns boolean indicating if the label is defined
 */
export function isLabelDefined(labelName: string): boolean {
  return labelName in issueLabels || labelName in prLabels;
}