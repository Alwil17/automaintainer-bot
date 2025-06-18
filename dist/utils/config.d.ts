import { Context } from "probot";
export interface AutoMaintainerConfig {
    todoMarkers: string[];
    defaultLabels: string[];
    autoCloseResolved: boolean;
}
export declare function loadRepoConfig(context: Context): Promise<AutoMaintainerConfig>;
