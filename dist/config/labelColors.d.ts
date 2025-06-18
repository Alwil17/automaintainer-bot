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
export declare const issueLabels: LabelDefinitions;
export declare const prLabels: LabelDefinitions;
/**
 * Get the appropriate label configuration by label name
 * @param labelName The name of the label to look up
 * @returns Label configuration with color and description
 */
export declare function getLabelConfig(labelName: string): LabelConfig | undefined;
/**
 * Get a combined list of all label names
 * @returns Array of all defined label names
 */
export declare function getAllLabelNames(): string[];
/**
 * Check if a label exists in our definitions
 * @param labelName The name of the label to check
 * @returns boolean indicating if the label is defined
 */
export declare function isLabelDefined(labelName: string): boolean;
