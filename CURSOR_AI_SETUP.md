# Cursor AI PR Review Setup & Troubleshooting

## Quick Setup

1. **Add API Key Secret:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add a new secret:
     - Name: `OPENAI_API_KEY` (or `CURSOR_API_KEY`)
     - Value: Your OpenAI API key (Cursor uses OpenAI API under the hood)

2. **The workflow will automatically run on:**
   - New pull requests
   - Updates to existing PRs
   - PR reopen events

## Why the Workflow Might Not Be Running

### 1. **Missing API Key Secret**
   - **Symptom**: Workflow runs but shows "⚠️ Neither CURSOR_API_KEY nor OPENAI_API_KEY is configured"
   - **Fix**: Add `OPENAI_API_KEY` or `CURSOR_API_KEY` in repository secrets

### 2. **Workflow File Not Committed**
   - **Symptom**: No workflow appears in Actions tab
   - **Fix**: Make sure `.github/workflows/cursor-ai-review.yml` is committed and pushed

### 3. **Workflow Not Triggering on PR**
   - **Symptom**: Workflow doesn't appear when creating a PR
   - **Possible causes:**
     - PR is from a fork (workflows from forks have limited permissions)
     - Workflow file is in a different branch
     - GitHub Actions is disabled for the repository

### 4. **Check Workflow Status**
   - Go to: **Actions** tab in your repository
   - Look for: **"Cursor AI PR Review"** workflow
   - Check if it's running or failed

## Testing the Workflow

1. **Commit the workflow file:**
   ```bash
   git add .github/workflows/cursor-ai-review.yml
   git commit -m "Add Cursor AI PR review workflow"
   git push
   ```

2. **Create a test PR:**
   - Create a new branch
   - Make some changes (add the bad code examples)
   - Push and create a PR
   - The workflow should run automatically

3. **Check the results:**
   - Go to the PR
   - Look for a comment from the bot
   - Check the Actions tab for workflow logs

## Workflow Files

- **`.github/workflows/cursor-ai-review.yml`** - New simplified workflow (use this one)
- **`.github/workflows/pr-analysis.yml`** - Old workflow (can be removed or kept)

## Manual Trigger

You can also manually trigger the workflow:
1. Go to **Actions** tab
2. Select **"Cursor AI PR Review"** workflow
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

## Common Issues

### Issue: "API key not configured"
**Solution**: Add `OPENAI_API_KEY` secret in repository settings

### Issue: "Request timeout"
**Solution**: The API call took too long. This is usually temporary. The workflow will retry on next PR update.

### Issue: "Error calling API"
**Solution**: 
- Check if your API key is valid
- Check if you have API credits/quota
- Verify the key has the correct permissions

### Issue: Workflow doesn't appear
**Solution**:
- Make sure the workflow file is in `.github/workflows/` directory
- Check that the file has `.yml` or `.yaml` extension
- Verify the file is committed to the default branch (usually `main`)

## Getting Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (you won't see it again!)
5. Add it as `OPENAI_API_KEY` secret in GitHub

## Next Steps

Once the workflow is running:
1. Create a PR with the bad code examples
2. Wait for the AI review comment
3. Check what issues it catches
4. Compare with the expected issues listed in `CURSOR_AI_TEST.md`

