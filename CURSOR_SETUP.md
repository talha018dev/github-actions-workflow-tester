# Using Cursor AI for PR Reviews

This guide explains how to use your paid Cursor plan to power AI code reviews in GitHub Actions.

## Why Use Cursor Instead of OpenAI?

- **Already Paid**: You're already paying for Cursor, so use those credits!
- **Better Context**: Cursor understands your codebase better
- **Claude Models**: Cursor uses Anthropic's Claude models, which excel at code review
- **Integrated Experience**: Seamless with your existing Cursor workflow

## Setup Instructions

### Option 1: Using Cursor CLI (Recommended)

1. **Get Your Cursor API Key**:
   - Open Cursor
   - Go to Settings → Account → API Keys
   - Generate a new API key for GitHub Actions
   - Copy the key

2. **Add GitHub Secret**:
   - Go to your repository: **Settings** → **Secrets and variables** → **Actions**
   - Add secret: `CURSOR_API_KEY` with your Cursor API key

3. **Use the Cursor Workflow**:
   - The workflow file `.github/workflows/pr-analysis-cursor.yml` is ready to use
   - Rename it to `pr-analysis.yml` to make it active, or keep both workflows

### Option 2: Using Cursor's API Directly

If Cursor CLI isn't available, the workflow will automatically fall back to using Cursor's API directly through the script at `.github/scripts/cursor-review.js`.

## Getting Your Cursor API Key

### Method 1: From Cursor Settings
1. Open Cursor
2. Press `Cmd/Ctrl + ,` to open Settings
3. Navigate to **Account** → **API Keys**
4. Click **Generate New Key**
5. Copy the key (you won't see it again!)

### Method 2: From Cursor Website
1. Visit [cursor.sh](https://cursor.sh)
2. Sign in to your account
3. Go to **Settings** → **API Keys**
4. Generate a new key for GitHub Actions

## Workflow Comparison

### Original Workflow (`pr-analysis.yml`)
- Uses OpenAI API directly
- Requires separate OpenAI API key
- Costs per API call

### Cursor Workflow (`pr-analysis-cursor.yml`)
- Uses your existing Cursor subscription
- Leverages Cursor's AI capabilities
- No additional API costs (within your plan limits)

## Configuration

### Update Workflow File

If you want to use Cursor exclusively, rename the workflow:

```bash
# Rename to make Cursor workflow active
mv .github/workflows/pr-analysis.yml .github/workflows/pr-analysis-backup.yml
mv .github/workflows/pr-analysis-cursor.yml .github/workflows/pr-analysis.yml
```

### Required Secrets

| Secret | Description | Where to Get It |
|--------|-------------|-----------------|
| `CURSOR_API_KEY` | Your Cursor API key | Cursor Settings → Account → API Keys |
| `SONAR_TOKEN` | SonarCloud token | [SonarCloud](https://sonarcloud.io) |
| `SONAR_ORGANIZATION` | SonarCloud org key | SonarCloud project settings |

## How It Works

1. **CodeQL Analysis**: Runs security scanning (unchanged)
2. **SonarCloud Analysis**: Runs code quality checks (unchanged)
3. **Cursor AI Review**: 
   - Fetches PR changes
   - Sends to Cursor AI for review
   - Posts results as PR comment
4. **Summary**: Combines all results into one comment

## Troubleshooting

### Cursor CLI Not Found
The workflow will automatically fall back to using the API directly via the Node.js script. This is handled automatically.

### API Key Issues
- Verify your Cursor API key is correct
- Check that your Cursor plan includes API access
- Ensure the key hasn't expired

### Rate Limits
Cursor has rate limits based on your plan:
- **Free Plan**: Limited API calls
- **Pro Plan**: Higher limits
- **Business Plan**: Highest limits

If you hit rate limits, the workflow will log an error but won't fail the entire workflow.

## Cost Comparison

### OpenAI Direct
- GPT-4: ~$0.01-0.03 per PR review
- GPT-3.5: ~$0.001-0.003 per PR review

### Cursor (Using Your Plan)
- **Included in your subscription**
- No additional per-API-call costs
- Uses your existing Cursor credits

## Best Practices

1. **Use Cursor for Reviews**: Since you're already paying for it
2. **Keep OpenAI as Backup**: You can keep both workflows and use Cursor as primary
3. **Monitor Usage**: Check your Cursor dashboard for API usage
4. **Optimize Prompts**: The review prompts are in the workflow file - customize them for your team

## Advanced: Customizing Cursor Review

Edit `.github/workflows/pr-analysis-cursor.yml` to customize:

- **Review Focus**: Change what Cursor looks for
- **Response Length**: Adjust `max_tokens`
- **Model Selection**: Choose which Cursor model to use
- **File Filters**: Control which files get reviewed

## Next Steps

1. Get your Cursor API key
2. Add it as a GitHub secret
3. Test with a PR
4. Enjoy AI-powered reviews using your existing Cursor subscription!

For more information, see:
- [Cursor Documentation](https://docs.cursor.com)
- [Cursor CLI Guide](https://docs.cursor.com/en/cli/github-actions)
- [GitHub Actions Workflow README](.github/workflows/README.md)

