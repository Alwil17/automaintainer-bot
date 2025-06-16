# AutoMaintainer

> A GitHub App built with [Probot](https://github.com/probot/probot) that A github auto maintainer app

## ✨ Features

### ✅ TODO Detection & Issue Creation
- Automatically scans for `// TODO:` comments on every `push`.
- Creates a GitHub Issue per TODO if it doesn't already exist.
- Issues contain file path, line number, and commit reference.

### 🏷️ Auto-labeling
- Adds contextual labels when an issue is opened based on keywords (e.g., `bug`, `feature`, `enhancement`).
- Adds labels to pull requests based on PR title (`chore`, `refactor`, `docs`, etc.).
- Ensures labels exist before applying them — creates them with color and description if missing.

### 📦 Fully extensible & modular
- Organized in modules (`events`, `utils`, `config`, etc.).
- Easily extendable with new features or GitHub event handlers.

## 🚀 Getting Started
### 🧑‍💻 Local Development

```sh
# Install dependencies
npm install

# build ts
npm run build

# Run the bot
npm start
```

Make sure you’ve created a GitHub App and copied the following credentials:

- `APP_ID`
- `PRIVATE_KEY` (in PEM format)
- `WEBHOOK_SECRET` (optional)

Use a .env file or pass them as environment variables.

## Docker

```sh
# 1. Build container
docker build -t AutoMaintainer .

# 2. Start container
docker run -e APP_ID=<app-id> -e PRIVATE_KEY=<pem-value> AutoMaintainer
```

## 🗂️ Project Structure

```
.
├── src/
│   ├── index.ts             # Entry point
│   ├── events/              # GitHub event handlers (issues, PRs, push)
│   ├── utils/               # Utilities (TODO processor, label manager)
│   └── config/labelColors.ts # Label colors definition
├── .env                     # Environment variables (optional)
├── Dockerfile
├── package.json
└── README.md
```

## 🔧 Configuration
You can define the behavior of TODO detection and labels in code. Future versions may support external config files like `.auto-maintainerrc`.

## Contributing

If you have suggestions for how AutoMaintainer could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2025 alwil17
