# microfox

A monorepo for building powerful, type-safe bot development tools and utilities. This repository contains various packages that help in building and managing bots efficiently.

## 🚀 Getting Started

This repository uses npm workspaces and Turborepo for managing multiple packages. Each package in the `packages` directory is published to npm under the `@microfox` scope.

### Prerequisites

- Node.js >= 18
- npm >= 10.2.4

### Installation

1. Clone the repository:

```bash
git clone https://github.com/microfox-ai/microfox.git
cd microfox
```

2. Install dependencies:

```bash
npm install
```

3. Build all packages:

```bash
npm run build
```

## 🛠️ Development

### Commands

- `npm run build` - Build all packages
- `npm run dev` - Start development mode for all packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Run ESLint across all packages
- `npm run clean` - Clean all build outputs
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
microfox/
├── packages/           # Core packages
├── examples/          # Example projects
├── tools/            # Development tools and configs
└── package.json      # Root package.json
```

Each package in the `packages` directory:

- Is published under the `@microfox` scope
- Has its own documentation
- Contains example usage in the `examples` directory
- Follows our standard development practices

### Branch Structure

We follow a three-tier branching strategy for organized development and deployment:

#### Main Branch (`main`)

- The production-ready branch
- Contains stable, tested code
- All releases are tagged from this branch
- Protected branch - requires pull request and review
- Direct commits are not allowed

#### Staging Branches (`staging/*`)

- Integration branches for feature testing
- Named as `staging/feature-group` (e.g., `staging/messaging-sdks`)
- Used for testing multiple related features together
- Merged into `main` after thorough testing
- QA and integration testing happens here
- Example: `staging/email-providers`, `staging/chat-platforms`

#### Development Branches (`dev/*`)

- Feature development branches
- Named as `dev/feature-name` (e.g., `dev/slack-sdk`)
- Created from `main` or relevant `staging` branch
- Merged into appropriate `staging` branch when complete
- Used for individual feature development
- Example: `dev/discord-webhooks`, `dev/sendgrid-integration`

### Branch Workflow

1. Create a development branch:

```bash
git checkout main
git pull
git checkout -b dev/slack-sdk
```

2. Develop and test your feature:

```bash
# Make changes
npm test
npm run build
git commit -m "feat: add slack sdk"
```

3. Push to staging:

```bash
git checkout staging/messaging-sdks
git merge dev/slack-sdk
# Run integration tests
```

4. Create release:

```bash
# Once staging is stable
git checkout main
git merge staging/messaging-sdks
npm run changeset
```

### Adding a New Package

When adding a new SDK or utility package, follow these naming and structure conventions:

1. Create a new development branch:

```bash
git checkout main
git pull
git checkout -b dev/slack-sdk
```

2. Create the package structure:

```bash
mkdir packages/slack-sdk
cd packages/slack-sdk
npm init -y
```

3. Set up the standard package files:

```
slack-sdk/
├── src/              # Source code
│   ├── index.ts      # Main entry point
│   ├── client.ts     # SDK client implementation
│   └── types.ts      # Type definitions
├── README.md         # Package documentation
├── tsconfig.json     # TypeScript config
└── package.json      # Package config
```

4. Create example implementation:

```bash
mkdir examples/slack-sdk-example
cd examples/slack-sdk-example
```

5. Set up example project structure:

```
slack-sdk-example/
├── src/
│   ├── index.ts              # Main example implementation
│   └── __tests__/           # Integration tests
│       └── slack.test.ts
├── README.md                 # Example documentation
├── tsconfig.json            # TypeScript config
└── package.json             # Example project config
```

4. Follow the development workflow in the Contributing section for next steps.

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b dev/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to staging (`git push origin staging/feature-group`)
5. Open a Pull Request to `main` when ready

### Development Workflow

1. Make changes in the relevant package(s)
2. Run tests: `npm test`
3. Build packages: `npm run build`
4. Create a changeset: `npm run changeset`
5. Commit and push your changes
