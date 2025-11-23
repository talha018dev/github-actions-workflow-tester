/**
 * TEST FILE: Additional Security Issues
 * This file contains intentional security vulnerabilities for testing CodeQL
 * DO NOT USE IN PRODUCTION
 */

// Issue 1: Hardcoded API key (using fake format to avoid GitHub secret scanning)
export const API_SECRET = "FAKE_API_KEY_1234567890_DO_NOT_USE"; // ❌ VULNERABILITY: Hardcoded secret

// Issue 2: SQL Injection vulnerability
export function getUserById(userId: string) {
  // ❌ VULNERABILITY: SQL Injection - user input directly in query
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  return query; // In real code, this would execute the query
}

// Issue 3: Command Injection
export function executeCommand(userInput: string) {
  // ❌ VULNERABILITY: Command Injection - user input in shell command
  const command = `ls -la ${userInput}`;
  return command; // In real code, this would execute via child_process
}

// Issue 4: Weak random number generation
export function generateToken() {
  // ❌ VULNERABILITY: Weak random - not cryptographically secure
  return Math.random().toString(36).substring(2, 15);
}

// Issue 5: Insecure comparison (timing attack)
export function comparePasswords(input: string, stored: string) {
  // ❌ VULNERABILITY: Timing attack - comparison leaks information
  return input === stored; // Should use constant-time comparison
}

// Issue 6: Path traversal vulnerability
export function readUserFile(filename: string) {
  // ❌ VULNERABILITY: Path traversal - no validation
  const path = `/users/data/${filename}`;
  // Could access ../../../etc/passwd
  return path;
}

// Issue 7: XSS vulnerability (for server-side rendering context)
export function renderUserContent(userContent: string) {
  // ❌ VULNERABILITY: XSS - unsanitized content
  return `<div>${userContent}</div>`;
}

// Issue 8: Insecure deserialization
export function deserializeData(data: string) {
  // ❌ VULNERABILITY: eval() can execute arbitrary code
  return eval(`(${data})`); // Dangerous!
}

// Issue 9: Weak hashing
import * as crypto from 'crypto';

export function hashPassword(password: string) {
  // ❌ VULNERABILITY: MD5 is cryptographically broken
  return crypto.createHash('md5').update(password).digest('hex');
}

// Issue 10: Insecure HTTP request
export async function fetchUserData(url: string) {
  // ❌ VULNERABILITY: HTTP instead of HTTPS
  const response = await fetch(`http://${url}/api/users`); // Should use https
  return response.json();
}

