import { Context } from "probot";
/**
 * Vérifie si c'est le premier issue créé par un utilisateur dans le repository
 *
 * @param context Le contexte Probot
 * @param username Nom d'utilisateur à vérifier
 * @returns true si c'est le premier issue de l'utilisateur, false sinon
 */
export declare function isFirstIssue(context: Context, username: string): Promise<boolean>;
/**
 * Poste un commentaire de bienvenue sur un issue
 *
 * @param context Le contexte Probot
 * @param issueNumber Numéro de l'issue
 */
export declare function postWelcomeComment(context: Context, issueNumber: number): Promise<void>;
/**
 * Vérifie si c'est la première pull request créée par un utilisateur dans le repository
 *
 * @param context Le contexte Probot
 * @param username Nom d'utilisateur à vérifier
 * @returns true si c'est la première PR de l'utilisateur, false sinon
 */
export declare function isFirstPullRequest(context: Context, username: string): Promise<boolean>;
/**
 * Poste un commentaire de bienvenue sur une pull request
 *
 * @param context Le contexte Probot
 * @param prNumber Numéro de la pull request
 */
export declare function postWelcomePrComment(context: Context, prNumber: number): Promise<void>;
