export default async function handleMemberAdded(context) {
    const { payload, octokit } = context;
    if (payload.action !== "added")
        return;
    const repo = payload.repository.name;
    const owner = payload.repository.owner.login;
    const username = payload.member.login;
    // Crée une issue de bienvenue pour le nouveau collaborateur
    await octokit.rest.issues.create({
        owner,
        repo,
        title: `Welcome @${username} as a new collaborator!`,
        body: `👋 Welcome @${username} to the repository! We're excited to have you as a collaborator.\n\nPlease take a moment to review our [CONTRIBUTING.md](../CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) guidelines.\n\nFeel free to ask any questions or suggest improvements. Happy collaborating! 🎉`
    });
}
//# sourceMappingURL=member.js.map