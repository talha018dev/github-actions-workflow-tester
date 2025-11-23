# Quick Setup Guide for PR Analysis Workflow

## 🚀 Quick Start

Follow these steps to enable automated PR analysis on your repository.

### Step 1: Add GitHub Secrets

Go to your repository: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these secrets:

#### Required for SonarCloud:
- **Name**: `SONAR_TOKEN`
  - **Value**: Get from [SonarCloud Account → Security → Generate Token](https://sonarcloud.io/account/security)

- **Name**: `SONAR_ORGANIZATION`
  - **Value**: Your SonarCloud organization key (e.g., `your-org-name`)

#### Required for AI Review:
- **Name**: `OPENAI_API_KEY`
  - **Value**: Get from [OpenAI Platform → API Keys](https://platform.openai.com/api-keys)

### Step 2: Set Up SonarCloud (First Time Only)

1. **Create SonarCloud Account**:
   - Visit [sonarcloud.io](https://sonarcloud.io)
   - Sign in with GitHub
   - Authorize SonarCloud to access your repositories

2. **Create Organization**:
   - Create a new organization (or use existing)
   - Note your organization key

3. **Create Project**:
   - Click "Analyze new project"
   - Select your repository
   - Note your project key
   - Update `sonar-project.properties` if needed:
     ```properties
     sonar.projectKey=your-project-key
     sonar.organization=your-org-key
     ```

### Step 3: Test the Workflow

1. Create a test pull request
2. The workflow will automatically run
3. Check the Actions tab to see results
4. Review comments will be posted on your PR

## ✅ Verification

After setup, when you create a PR, you should see:

1. **Three jobs running** in the Actions tab:
   - CodeQL Security Analysis
   - SonarCloud Code Quality
   - AI-Powered PR Review

2. **Comments on your PR**:
   - AI review comment with code suggestions
   - Summary comment with all analysis results

## 🔧 Troubleshooting

### Workflow not running?
- Check that the workflow file is in `.github/workflows/`
- Verify the workflow file syntax is correct
- Check Actions tab for error messages

### SonarCloud failing?
- Verify `SONAR_TOKEN` and `SONAR_ORGANIZATION` secrets are set
- Check that your SonarCloud project exists
- Verify the project key in `sonar-project.properties` matches

### AI Review not working?
- Verify `OPENAI_API_KEY` secret is set
- Check that your OpenAI account has credits
- Review workflow logs for API errors

### CodeQL not running?
- For private repos: Ensure GitHub Advanced Security is enabled
- Check that your repository has code in supported languages

## 💰 Cost Estimates

- **CodeQL**: Free for all repositories
- **SonarCloud**: Free for public repos, paid plans for private repos
- **OpenAI API**: ~$0.01-0.03 per PR review (using GPT-4)

To reduce costs:
- Use GPT-3.5-turbo instead (modify model in workflow)
- Skip AI review for draft PRs (add condition)
- Limit review to specific file types

## 📝 Next Steps

- Customize the AI review prompt for your team's needs
- Adjust CodeQL queries in `codeql-config.yml`
- Configure SonarCloud quality gates
- Set up branch protection rules requiring these checks

For detailed documentation, see [.github/workflows/README.md](.github/workflows/README.md)

