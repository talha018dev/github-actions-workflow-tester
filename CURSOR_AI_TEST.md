# Testing Cursor AI PR Review

## What Was Done

1. ✅ **Disabled CodeQL** - Commented out the CodeQL analysis job
2. ✅ **Updated Workflow** - Now only runs Cursor AI review
3. ✅ **Created Bad Code Examples** - Added intentional code quality issues for Cursor AI to catch

## Bad Code Files Created

### 1. `features/bad-code-examples/components/PoorQualityComponent.tsx`
**Issues Cursor AI Should Catch:**
- ❌ Using `any` type everywhere
- ❌ Unused variables
- ❌ Missing dependency arrays in useEffect (infinite re-renders)
- ❌ Inline functions in render (performance issues)
- ❌ No error handling
- ❌ Magic numbers
- ❌ Inline styles instead of Tailwind
- ❌ Missing accessibility attributes
- ❌ Using index as key
- ❌ Memory leaks (uncleared timers)
- ❌ Poor naming (single letter variables)

### 2. `features/bad-code-examples/utils/badPractices.ts`
**Issues Cursor AI Should Catch:**
- ❌ Global mutable state
- ❌ Callback hell (deeply nested callbacks)
- ❌ Mutating function parameters
- ❌ Inconsistent error handling
- ❌ Duplicate code
- ❌ Using `var` instead of `const/let`
- ❌ Type assertions everywhere (defeating TypeScript)
- ❌ No input validation
- ❌ Synchronous blocking operations
- ❌ Inefficient algorithms (O(n²) when O(n) would work)
- ❌ Hardcoded values (magic numbers)
- ❌ Unused imports
- ❌ Mixing concerns

### 3. `features/bad-code-examples/hooks/badHooks.ts`
**Issues Cursor AI Should Catch:**
- ❌ Conditional hook usage (React rules violation)
- ❌ Hooks in regular functions
- ❌ useEffect with wrong dependencies
- ❌ useEffect that should be useMemo
- ❌ Side effects in render
- ❌ useCallback without dependencies
- ❌ useMemo for non-expensive computations
- ❌ Multiple useState for related data (should be one object)
- ❌ useEffect with async function incorrectly
- ❌ Inconsistent return types

## How to Test

1. **Commit the bad code files:**
   ```bash
   git add features/bad-code-examples/
   git commit -m "test: Add bad code examples for Cursor AI review testing"
   git push
   ```

2. **Create a Pull Request:**
   - Go to GitHub and create a PR with these changes
   - The Cursor AI review workflow will run automatically

3. **Check the Results:**
   - Look for a comment from the bot with "🤖 Cursor AI Code Review"
   - The review should point out all the bad practices listed above

## What Cursor AI Should Review

### Code Quality Issues:
- Type safety violations (`any` types)
- React hooks violations
- Performance issues (unnecessary re-renders)
- Memory leaks
- Poor naming conventions
- Code duplication
- Inconsistent patterns

### Best Practices:
- Missing error handling
- Inefficient algorithms
- Hardcoded values
- Unused code
- Mixing concerns
- Accessibility issues

### React-Specific:
- Hooks rules violations
- useEffect dependency issues
- Performance optimizations needed
- Component structure improvements

## Expected Cursor AI Feedback

The AI should provide:
1. **Critical Issues**: Hooks violations, memory leaks, type safety
2. **Code Quality**: Performance issues, best practices
3. **Suggestions**: Specific improvements with examples
4. **Positive Feedback**: (if any good code exists)

## Notes

- CodeQL is now **disabled** - only Cursor AI will run
- The bad code files are intentionally problematic
- Cursor AI should catch most of these issues
- Review comments will be posted on your PR automatically

