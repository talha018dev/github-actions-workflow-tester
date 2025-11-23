# GitHub Actions Workflow Setup

This repository includes a comprehensive PR analysis workflow that combines CodeQL security scanning, SonarCloud code quality analysis, and AI-powered code review.

## Workflow Overview

The `pr-analysis.yml` workflow runs automatically on every pull request and includes:

1. **CodeQL Security Analysis** - Scans for security vulnerabilities
2. **SonarCloud Code Quality** - Analyzes code quality and maintainability
3. **AI-Powered PR Review** - Provides intelligent code review using OpenAI
4. **Analysis Summary** - Posts a summary comment with all results

## Setup Instructions

### 1. CodeQL Setup

CodeQL is automatically configured and requires no additional setup. It will scan JavaScript and TypeScript files for security vulnerabilities.

### 2. SonarCloud Setup

1. **Create a SonarCloud account**:
   - Go to [sonarcloud.io](https://sonarcloud.io)
   - Sign in with your GitHub account
   - Create a new organization (or use existing)

2. **Create a new project**:
   - In SonarCloud, create a new project for this repository
   - Note your organization key and project key

3. **Generate a SonarCloud token**:
   - Go to: Account > Security > Generate Token
   - Copy the generated token

4. **Add GitHub Secrets**:
   - Go to your repository: Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `SONAR_TOKEN`: Your SonarCloud token
     - `SONAR_ORGANIZATION`: Your SonarCloud organization key

### 3. AI-Powered PR Review Setup

1. **Get an OpenAI API Key**:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key

2. **Add GitHub Secret**:
   - Go to your repository: Settings > Secrets and variables > Actions
   - Add secret: `OPENAI_API_KEY`: Your OpenAI API key

### 4. Required GitHub Secrets

Add these secrets in your repository settings:

| Secret Name | Description | Required |
|------------|-------------|----------|
| `SONAR_TOKEN` | SonarCloud authentication token | Yes (for SonarCloud) |
| `SONAR_ORGANIZATION` | SonarCloud organization key | Yes (for SonarCloud) |
| `OPENAI_API_KEY` | OpenAI API key for AI reviews | Yes (for AI review) |

## Workflow Behavior

- **Triggers**: Runs on PR open, update, reopen, and when marked ready for review
- **Parallel Execution**: All three analyses run in parallel for faster results
- **Comments**: Results are posted as PR comments
- **Failure Handling**: Workflow continues even if one analysis fails

## Customization

### Modify CodeQL Configuration

Edit `codeql-config.yml` to:
- Change scanned file patterns
- Add/remove query packs
- Exclude specific paths

### Modify SonarCloud Configuration

Edit `sonar-project.properties` to:
- Change project key
- Modify source paths
- Adjust coverage settings

### Customize AI Review

The AI review prompt can be customized in the workflow file (`.github/workflows/pr-analysis.yml`) in the `ai-pr-review` job step.

## Troubleshooting

### CodeQL Issues
- Ensure your repository has GitHub Advanced Security enabled (for private repos)
- Check that the languages are correctly detected

### SonarCloud Issues
- Verify your token has the correct permissions
- Check that the organization key matches your SonarCloud organization
- Ensure the project key in `sonar-project.properties` matches your SonarCloud project

### AI Review Issues
- Verify your OpenAI API key is valid and has credits
- Check that the API key has access to GPT-4 models
- Review the workflow logs for detailed error messages

## Cost Considerations

- **CodeQL**: Free for public repositories
- **SonarCloud**: Free tier available for public repositories
- **OpenAI API**: Pay-per-use based on tokens consumed (GPT-4 is more expensive than GPT-3.5)

To reduce costs, you can:
- Use GPT-3.5-turbo instead of GPT-4 (modify the model in the workflow)
- Limit AI review to specific file types or PR sizes
- Add conditions to skip AI review for draft PRs

## Security Notes

- Never commit API keys or tokens to the repository
- Use GitHub Secrets for all sensitive information
- Regularly rotate your API keys and tokens
- Review the permissions granted to GitHub Actions

