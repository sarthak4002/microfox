# Microfox

> Code that writes code that writes code

Microfox is an ambitious open-source project that combines microservices architecture with deep coding principles. It's designed to be the foundation for the next generation of AI-powered development tools and agents.

## 🚀 Vision

Microfox is built on two core philosophies:

1. **Microservices Architecture**: Breaking down complex systems into small, independent services
2. **Deep Coding**: Creating code that writes code that writes code - enabling AI agents to build and maintain software

Software should never be a MOAT, and we promise that all the SDKs here will be continously mainteained, tested & free for everyone to use.

All our SDKs are:

- Open source and free to use
- Published under the `@microfox` scope on npm
- Built with TypeScript
- Include comprehensive documentation and examples
- Support AI agent integration
- Bytesized to support serverless environments

## 🛠️ Core Components

### Package Fox

Our automated SDK creation system that:

- Automatically generates TypeScript SDKs from API documentation
- Supports REST, GraphQL, and other API types
- Generates comprehensive documentation and examples
- Generates embeddings for better AI agent integration
- Built with Zod for type safety and validation
- Does compile testing & auto fix any issues if detected

## 📦 Roadmap

- **_Packagefox as MCP_** Imagine the ability to easily integrate any platform in your application
- **_Testfox_** Auto create unit tests & e2e tests for all packages
- **_VersionTracking_** Auto updates for any API migrations of existing packages
- **_Support for Python->Typscript workflow_** a template flow inside packagefox for supportting migrations of python -> typescript packages

### 🤖 AI Agent Integration

Our SDKs are designed to work seamlessly with AI agents:

- Built-in documentation embeddings for better context
- Example-based documentation for improved code generation
- Type-safe interfaces for reliable integration
- Automatic version tracking and updates

## 🛠️ Development

### Commands

- `npm run build` - Build all packages
- `npm run build -- --filter=@microfox/whatsapp-business` - Build only 1 packages
- `npm run test` - Run tests across all packages
- `npm run lint` - Run ESLint across all packages
- `npm run clean` - Clean all build outputs
- `npm run type-check` - Run TypeScript type checking

### Project Structure

```
microfox/
├── packages/           # Core packages
├── examples/          # Example projects
├── scripts/            # All coding agents live here
└── package.json      # Root package.json
```

Each package in the `packages` directory:

- Is published under the `@microfox` scope
- Has its own documentation
- Follows our standard development practices

## 🤝 Contributing

Here's how you can help:

### High level Contributions

1. **_Coding Agents_** Check for issues labeled with Coding Agents (Build or Fix the core generation scripts)
2. **_SDK Design_** Good SDKs are built on top of good design standards (create a new vision for a different kind of packages)

### Quick Contributions (Auto Builds & Auto Fixes)

1. **Request New SDKs**: Create an issue with the API documentation URL (to autobuild start issue title with `packagefox: TITLE`)
2. **Report Issues**: Help us improve by reporting bugs or suggesting improvements (to autofix the issue title with `packagefox: TITLE`)

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b dev/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Open a Pull Request to staging (`git push origin staging/feature-group`)

## 🔒 Security

All SDKs go through a security review process:

- Automated initial screening
- Manual review by our development team
- Scheduled npm publishing for verified packages

## 🌟 Join the Revolution

Microfox represents a new paradigm in software development:

- AI-powered SDK generation
- Community-driven maintenance
- Open source and accessible to all
- Built for the future of AI-assisted development

Join us in building the future of software development!

## 📝 License

MIT License - See LICENSE file for details


<!-- STABLE_PACKAGES_TABLE_START -->
### Stable Packages

| Package | Links | Stats | Info |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/aws-ses.svg" alt="Microfox AWS SES logo" width="24" height="24"> Microfox AWS SES v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/aws-ses.svg)](https://www.npmjs.com/package/@microfox/aws-ses) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/aws-ses/README.md) | 1 creates, 3 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/brave.svg" alt="Brave TypeScript SDK logo" width="24" height="24"> Brave TypeScript SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/brave.svg)](https://www.npmjs.com/package/@microfox/brave) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/brave/README.md) | 1 creates, 8 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/coingecko-sdk.svg" alt="CoinGecko SDK logo" width="24" height="24"> CoinGecko SDK v1.0.1 | [![npm version](https://img.shields.io/npm/v/@microfox/coingecko-sdk.svg)](https://www.npmjs.com/package/@microfox/coingecko-sdk) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/coingecko-sdk/README.md) | 1 creates, 14 fns, APIKEY auth ![API Key](https://img.shields.io/badge/auth-API%20Key-green.svg) |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/discord-icon.svg" alt="Microfox Discord SDK logo" width="24" height="24"> Microfox Discord SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/discord.svg)](https://www.npmjs.com/package/@microfox/discord) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/discord/README.md) | 1 creates, 32 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google-drive.svg" alt="Microfox Drive SDK logo" width="24" height="24"> Microfox Drive SDK v1.0.3 | [![npm version](https://img.shields.io/npm/v/@microfox/drive.svg)](https://www.npmjs.com/package/@microfox/drive) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google-gmail.svg" alt="Gmail SDK logo" width="24" height="24"> Gmail SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/gmail.svg)](https://www.npmjs.com/package/@microfox/gmail) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://raw.githubusercontent.com/microfox-ai/microfox/main/README.md) | 1 creates, 11 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google-analytics.svg" alt="Google Analytics SDK logo" width="24" height="24"> Google Analytics SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/google-analytics.svg)](https://www.npmjs.com/package/@microfox/google-analytics) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/google-analytics/README.md) | 1 creates, 23 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google-search-console.svg" alt="Google Search Console logo" width="24" height="24"> Google Search Console v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/google-seo.svg)](https://www.npmjs.com/package/@microfox/google-seo) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/google-seo/README.md) | 1 creates, 13 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google-sheets-icon.svg" alt="Google Sheets SDK logo" width="24" height="24"> Google Sheets SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/google-sheets.svg)](https://www.npmjs.com/package/@microfox/google-sheets) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/google-sheets/README.md) | 1 creates, 10 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/instagram-icon.svg" alt="Microfox Instagram SDK logo" width="24" height="24"> Microfox Instagram SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/instagram.svg)](https://www.npmjs.com/package/@microfox/instagram) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/instagram/README.md) | 1 creates, 15 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/instagram-icon.svg" alt="Microfox Instagram Business OAuth logo" width="24" height="24"> Microfox Instagram Business OAuth v1.0.1 | [![npm version](https://img.shields.io/npm/v/@microfox/instagram-business-oauth.svg)](https://www.npmjs.com/package/@microfox/instagram-business-oauth) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/instagram-icon.svg" alt="Instagram SDK logo" width="24" height="24"> Instagram SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/instagram-fb.svg)](https://www.npmjs.com/package/@microfox/instagram-fb) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/instagram-fb/README.md) | 1 creates, 16 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/instagram-icon.svg" alt="Microfox Instagram FB Business OAuth logo" width="24" height="24"> Microfox Instagram FB Business OAuth v1.0.1 | [![npm version](https://img.shields.io/npm/v/@microfox/instagram-fb-business-oauth.svg)](https://www.npmjs.com/package/@microfox/instagram-fb-business-oauth) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/linkedin-icon.svg" alt="LinkedIn Member Data Portability SDK logo" width="24" height="24"> LinkedIn Member Data Portability SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/linkedin-member-data-portability.svg)](https://www.npmjs.com/package/@microfox/linkedin-member-data-portability) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/linkedin-member-data-portability/README.md) | 1 creates, 7 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/packages/linkedin-share/icon.svg" alt="LinkedIn Share logo" width="24" height="24"> LinkedIn Share v1.2.0 | [![npm version](https://img.shields.io/npm/v/@microfox/linkedin-share.svg)](https://www.npmjs.com/package/@microfox/linkedin-share) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/linkedin-share/README.md) | 1 creates, 3 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/reddit.svg" alt="Reddit TypeScript SDK logo" width="24" height="24"> Reddit TypeScript SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/reddit.svg)](https://www.npmjs.com/package/@microfox/reddit) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/reddit/README.md) | 1 creates, 26 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/reddit.svg" alt="Microfox Reddit OAuth logo" width="24" height="24"> Microfox Reddit OAuth v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/reddit-oauth.svg)](https://www.npmjs.com/package/@microfox/reddit-oauth) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates, 6 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/slack-icon.svg" alt="Microfox Slack Web Tiny logo" width="24" height="24"> Microfox Slack Web Tiny v1.2.0 | [![npm version](https://img.shields.io/npm/v/@microfox/slack-web-tiny.svg)](https://www.npmjs.com/package/@microfox/slack-web-tiny) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/slack-web-tiny/README.md) | 1 creates, 4 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/x.svg" alt="Microfox X SDK logo" width="24" height="24"> Microfox X SDK v1.1.0 | [![npm version](https://img.shields.io/npm/v/@microfox/twitter.svg)](https://www.npmjs.com/package/@microfox/twitter) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/twitter/README.md) | 1 creates, 12 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/whatsapp-icon.svg" alt="Whatsapp Business logo" width="24" height="24"> Whatsapp Business v1.2.2 | [![npm version](https://img.shields.io/npm/v/@microfox/whatsapp-business.svg)](https://www.npmjs.com/package/@microfox/whatsapp-business) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates, 36 fns N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/youtube-icon.svg" alt="YouTube Data logo" width="24" height="24"> YouTube Data v1.0.4 | [![npm version](https://img.shields.io/npm/v/@microfox/youtube.svg)](https://www.npmjs.com/package/@microfox/youtube) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/youtube-icon.svg" alt="Youtube Analytics V3 logo" width="24" height="24"> Youtube Analytics V3 v1.0.1 | [![npm version](https://img.shields.io/npm/v/@microfox/youtube-analytics.svg)](https://www.npmjs.com/package/@microfox/youtube-analytics) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/youtube-analytics/README.md) | 1 creates, 11 fns, OAUTH2 auth ![OAuth](https://img.shields.io/badge/auth-OAuth-blue.svg) |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/youtube.svg" alt="YouTube Reporting API logo" width="24" height="24"> YouTube Reporting API v1.0.1 | [![npm version](https://img.shields.io/npm/v/@microfox/youtube-reporting-api.svg)](https://www.npmjs.com/package/@microfox/youtube-reporting-api) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](https://github.com/microfox-ai/microfox/blob/main/packages/youtube-reporting-api/README.md) | 1 creates, 6 fns, OAUTH2 auth ![OAuth](https://img.shields.io/badge/auth-OAuth-blue.svg) |
<!-- STABLE_PACKAGES_TABLE_END -->

<!-- OAUTH_CONNECTORS_TABLE_START -->
### OAuth Connectors

| Package | Links | Stats | Info |
| --- | --- | --- | --- |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/logos/google.svg" alt="Microfox Google SDK logo" width="24" height="24"> Microfox Google SDK v1.1.1 | [![npm version](https://img.shields.io/npm/v/@microfox/google.svg)](https://www.npmjs.com/package/@microfox/google) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates, oauthConnector N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/packages/google-oauth/icon.svg" alt="Microfox Google OAuth SDK logo" width="24" height="24"> Microfox Google OAuth SDK v1.0.4 | [![npm version](https://img.shields.io/npm/v/@microfox/google-oauth.svg)](https://www.npmjs.com/package/@microfox/google-oauth) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates, oauthConnector N/A |
| <img src="https://raw.githubusercontent.com/microfox-ai/microfox/refs/heads/main/packages/linkedin-oauth/icon.svg" alt="LinkedIn OAuth logo" width="24" height="24"> LinkedIn OAuth v1.0.5 | [![npm version](https://img.shields.io/npm/v/@microfox/linkedin-oauth.svg)](https://www.npmjs.com/package/@microfox/linkedin-oauth) [![Documentation](https://img.shields.io/badge/docs-available-blue.svg)](/README.md) | 1 creates, oauthConnector N/A |
<!-- OAUTH_CONNECTORS_TABLE_END -->