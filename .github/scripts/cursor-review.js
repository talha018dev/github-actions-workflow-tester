/**
 * Cursor AI PR Review Script
 * Uses Cursor API to analyze PR changes and provide intelligent feedback
 */

const https = require('https');
const fs = require('fs');

const CURSOR_API_KEY = process.env.CURSOR_API_KEY;
const PR_DATA_JSON = process.argv[2] || '{}';

if (!CURSOR_API_KEY) {
  console.error('⚠️ CURSOR_API_KEY is not set');
  process.exit(1);
}

const prData = JSON.parse(PR_DATA_JSON);

async function callCursorAPI(prompt) {
  return new Promise((resolve, reject) => {
    // Cursor API endpoint (adjust based on actual Cursor API)
    // Note: This may need to be updated based on Cursor's actual API structure
    const data = JSON.stringify({
      model: 'claude-3-opus', // Cursor typically uses Claude models
      messages: [
        {
          role: 'system',
          content: 'You are an expert code reviewer specializing in Next.js, React, TypeScript, and modern web development. Provide a concise, actionable code review focusing on critical issues, code quality, suggestions, and positive feedback.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    // Try Cursor API endpoint (this may need adjustment)
    const options = {
      hostname: 'api.cursor.sh',
      port: 443,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CURSOR_API_KEY}`,
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(responseData);
            resolve(response.choices[0].message.content);
          } catch (e) {
            // Fallback: Try alternative response format
            resolve(responseData);
          }
        } else {
          // If Cursor API fails, try using Cursor's underlying model (Anthropic)
          callAnthropicAPI(prompt).then(resolve).catch(reject);
        }
      });
    });

    req.on('error', (error) => {
      // Fallback to Anthropic API
      callAnthropicAPI(prompt).then(resolve).catch(reject);
    });

    req.write(data);
    req.end();
  });
}

async function callAnthropicAPI(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-3-opus-20240229',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CURSOR_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(responseData);
          resolve(response.content[0].text);
        } else {
          reject(new Error(`Anthropic API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function analyzePR() {
  if (!prData || !prData.files || prData.files.length === 0) {
    return '✅ No code files changed in this PR.';
  }

  const fileSummaries = prData.files.map(f => 
    `### ${f.filename} (${f.status})\n- Additions: +${f.additions}, Deletions: -${f.deletions}\n\`\`\`diff\n${f.patch || 'No diff available'}\n\`\`\``
  ).join('\n\n');

  const prompt = `Review this pull request:

**PR Title**: ${prData.title || 'N/A'}
**PR Description**: ${prData.body || 'No description provided'}

**Changed Files**:
${fileSummaries}

Please provide a comprehensive code review focusing on:
1. Critical Issues: Security vulnerabilities, bugs, or breaking changes
2. Code Quality: Best practices, patterns, and maintainability
3. Suggestions: Specific improvements with code examples when helpful
4. Positive Feedback: Acknowledge good practices and clean code

Format your response in markdown with clear sections. Be constructive and specific.`;

  try {
    const review = await callCursorAPI(prompt);
    return review;
  } catch (error) {
    console.error('Error calling Cursor API:', error);
    return `⚠️ Error generating Cursor AI review: ${error.message}\n\nPlease check your CURSOR_API_KEY configuration.`;
  }
}

// Main execution
if (require.main === module) {
  analyzePR()
    .then(review => {
      console.log(review);
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { analyzePR };

