const labelColors: Record<string, string> = {
    bug: "d73a4a",
    enhancement: "a2eeef",
    feature: "0e8a16",
    refactor: "cfd3d7",
    chore: "eeeeee",
    documentation: "0075ca",
    triage: "fbca04",
};

export async function ensureLabelsExist(context: any, labels: string[]) {
    const { owner, repo } = context.repo();
    for (const label of labels) {
        try {
            await context.octokit.issues.getLabel({
                owner,
                repo,
                name: label,
            });
        } catch (error: any) {
            if (error.status === 404) {
                await context.octokit.issues.createLabel({
                    owner,
                    repo,
                    name: label,
                    color: labelColors[label] || "ededed", // default if unknown
                    description: `Auto-generated label: ${label}`,
                });
            } else {
                throw error;
            }
        }
    }
}