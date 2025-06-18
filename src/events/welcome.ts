import { Context } from "probot";
import { loadRepoConfig } from "../utils/config.js";

/**
 * Vérifie si c'est le premier issue créé par un utilisateur dans le repository
 * 
 * @param context Le contexte Probot
 * @param username Nom d'utilisateur à vérifier
 * @returns true si c'est le premier issue de l'utilisateur, false sinon
 */
export async function isFirstIssue(context: Context, username: string): Promise<boolean> {
  const repo = context.repo();
  
  try {
    // Rechercher tous les issues créés par l'utilisateur
    const { data: issues } = await context.octokit.issues.listForRepo({
      ...repo,
      creator: username,
      state: "all"
    });
    
    // Si nous avons exactement une issue (celle qui vient d'être créée), c'est la première
    return issues.length === 1;
  } catch (error) {
    context.log.error(`Erreur lors de la vérification du premier issue pour ${username}: ${error}`);
    // En cas d'erreur, on suppose que ce n'est pas le premier issue pour éviter des messages en double
    return false;
  }
}

/**
 * Poste un commentaire de bienvenue sur un issue
 * 
 * @param context Le contexte Probot
 * @param issueNumber Numéro de l'issue
 */
export async function postWelcomeComment(context: Context, issueNumber: number): Promise<void> {
  const config = await loadRepoConfig(context);
  const welcomeMessage = config.welcomeMessage || 
    "👋 Welcome and thanks for opening your first issue! We're glad to have you here 🎉\n\nIf you need help, check out the CONTRIBUTING.md guide.";
  
  try {
    await context.octokit.issues.createComment({
      ...context.repo(),
      issue_number: issueNumber,
      body: welcomeMessage
    });
    
    context.log.info(`Message de bienvenue posté sur l'issue #${issueNumber}`);
  } catch (error) {
    context.log.error(`Erreur lors de la création du commentaire de bienvenue: ${error}`);
  }
}

/**
 * Vérifie si c'est la première pull request créée par un utilisateur dans le repository
 * 
 * @param context Le contexte Probot
 * @param username Nom d'utilisateur à vérifier
 * @returns true si c'est la première PR de l'utilisateur, false sinon
 */
export async function isFirstPullRequest(context: Context, username: string): Promise<boolean> {
  const repo = context.repo();
  
  try {
    // Rechercher toutes les pull requests créées par l'utilisateur
    const { data: pullRequests } = await context.octokit.pulls.list({
      ...repo,
      creator: username,
      state: "all"
    });
    
    // Si nous avons exactement une pull request (celle qui vient d'être créée), c'est la première
    return pullRequests.length === 1;
  } catch (error) {
    context.log.error(`Erreur lors de la vérification de la première PR pour ${username}: ${error}`);
    // En cas d'erreur, on suppose que ce n'est pas la première PR pour éviter des messages en double
    return false;
  }
}

/**
 * Poste un commentaire de bienvenue sur une pull request
 * 
 * @param context Le contexte Probot
 * @param prNumber Numéro de la pull request
 */
export async function postWelcomePrComment(context: Context, prNumber: number): Promise<void> {
  const config = await loadRepoConfig(context);
  const welcomePrMessage = config.welcomePrMessage || 
    "👋 Welcome and thank you for your first pull request! We're thrilled to have your contribution 🎉\n\nPlease make sure you've read the CONTRIBUTING.md guide for development guidelines.";
  
  try {
    await context.octokit.issues.createComment({
      ...context.repo(),
      issue_number: prNumber,
      body: welcomePrMessage
    });
    
    context.log.info(`Message de bienvenue posté sur la PR #${prNumber}`);
  } catch (error) {
    context.log.error(`Erreur lors de la création du commentaire de bienvenue sur la PR: ${error}`);
  }
}
