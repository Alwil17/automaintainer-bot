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
