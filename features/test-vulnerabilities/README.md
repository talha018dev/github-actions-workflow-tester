# ⚠️ TEST VULNERABILITIES - DO NOT USE IN PRODUCTION

This directory contains **intentional security vulnerabilities and code quality issues** for testing GitHub Actions workflows (CodeQL, SonarCloud, etc.).

## Purpose

These files are created to verify that:
- CodeQL security analysis catches vulnerabilities
- Code quality checks identify issues
- GitHub Actions workflows are functioning correctly

## Files

1. **`nullPointerTest.ts`** - Contains null pointer dereference vulnerabilities
2. **`resourceLeakTest.ts`** - Contains resource leak issues (unclosed files, streams)
3. **`raceConditionTest.ts`** - Contains race condition vulnerabilities

## Issues Included

### Null Pointer Dereferences
- Accessing properties on null/undefined objects
- Array access without bounds checking
- Missing null checks in async functions

### Resource Leaks
- Unclosed file handles
- Unclosed streams
- Missing cleanup in error paths
- Database connections not closed

### Race Conditions
- Shared state modification without synchronization
- Non-atomic read-modify-write operations
- Concurrent async operations on shared resources

## Testing

1. Create a pull request with these files
2. Check GitHub Actions workflow results
3. Verify that CodeQL catches these issues
4. Review the security alerts generated

## Cleanup

**After testing, these files should be removed** or moved to a test directory that's excluded from production builds.

## Exclusions

These files are excluded from:
- Production builds (via build configuration)
- Type checking (if needed, add to tsconfig exclude)
- Code coverage (test files)

