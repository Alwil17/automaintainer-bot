# 🤖 AutoMaintainer-bot

[![CI](https://github.com/Alwil17/automaintainer-bot/actions/workflows/deploy.yml/badge.svg)](https://github.com/Alwil17/automaintainer-bot/actions)
[![Docker Pulls](https://img.shields.io/docker/pulls/alwil17/automaintainer-bot)](https://hub.docker.com/r/alwil17/automaintainer-bot)
[![License](https://img.shields.io/github/license/Alwil17/automaintainer-bot)](LICENSE)


> **AutoMaintainer-bot** is a GitHub App bot designed to help developers automatically manage TODOs in code.  
Every time you push code, it scans your diffs and extracts TODO comments like:

## ✨ Features

### ✅ TODO Detection & Issue Creation
- Scans for `TODO` comments on every `push`.
- Creates a GitHub Issue per TODO if it doesn't already exist.
- Issues include file path, line number, and commit reference.
- Supports single-line, block, and multi-line TODOs
- Avoids duplicates with content hashing

### 🏷️ Auto-labeling
- Adds contextual labels to issues based on keywords (e.g., `bug`, `feature`, `enhancement`).
- Adds labels to pull requests based on PR title (`chore`, `refactor`, `docs`, etc.).
- Ensures labels exist before applying them — creates them with color and description if missing.

### 📦 Modular & Extensible
- Organized in modules: `events`, `utils`, `config`.
- Easily extendable with new features or GitHub event handlers.

## 🚀 Getting Started

### 🧑‍💻 Local Development

```sh
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run the bot (in development)
npm start
```

#### Environment Variables

Create a `.env` file in the project root or set these variables in your environment:

- `APP_ID` — Your GitHub App's ID
- `PRIVATE_KEY` — The private key for your GitHub App (PEM format, can use `PRIVATE_KEY_PATH` instead)
- `WEBHOOK_SECRET` — (Optional) Webhook secret for your GitHub App

Example `.env`:

```
APP_ID=12345
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
WEBHOOK_SECRET=yoursecret
```

### 🐳 Docker

```sh
# 1. Build container
docker build -t automaintainer .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY="<pem-value>" automaintainer
```

## 🗂️ Project Structure

```
.
├── src/
│   ├── index.ts               # Entry point and main app logic
│   ├── events/                # GitHub event handlers (e.g., issues, PRs, push)
│   │   ├── issues.ts
│   │   ├── pullRequests.ts
│   │   └── push.ts
│   ├── utils/                 # Utilities (e.g., TODO processor, label manager)
│   │   ├── todoProcessor.ts
│   │   └── labelManager.ts
│   └── config/
│       └── labelColors.ts     # Label colors definition
├── .env                       # Environment variables (optional)
├── Dockerfile                 # Docker container definition
├── package.json               # Project metadata and scripts
└── README.md                  # Project documentation
```

## 🔧 Configuration

To customize the bot, create a `.github/auto-maintainer.yml` file in your repository:

```yaml
todoMarkers:
  - TODO:
  - FIXME:
defaultLabels:
  - triage
  - needs-review
autoCloseResolved: true
```

## 🧩 Extending

To add new features or event handlers:
1. Add a new handler in `src/events/`.
2. Register it in `src/index.ts`.
3. Add any utility functions to `src/utils/`.

## 📝 Contributing

Contributions are welcome! If you have suggestions, bug reports, or want to add features:

- Open an issue or pull request.
- See the [Contributing Guide](CONTRIBUTING.md) for more details.

## 📄 License

[ISC](LICENSE) © 2025 Alwil17

## 🙋 FAQ

**Q: How do I create a GitHub App for this?**  
A: See [Probot's docs](https://probot.github.io/docs/development/#create-a-github-app) for step-by-step instructions.

**Q: Can I customize TODO detection?**  
A: Not yet, but planned for future releases.

**Q: Where do I add new event handlers?**  
A: In `src/events/` and register them in `src/index.ts`.

---
