/**
 * TEST FILE: Null Pointer Dereference Issues
 * This file contains intentional vulnerabilities for testing CodeQL
 * DO NOT USE IN PRODUCTION
 */

// Issue 1: Accessing property on potentially null/undefined object
export function getUserEmail(user: { email?: string } | null) {
  // ❌ VULNERABILITY: No null check before accessing property
  return user.email.toLowerCase(); // Will crash if user is null
}

// Issue 2: Array access without bounds checking
export function getFirstItem(items: string[] | null) {
  // ❌ VULNERABILITY: No null check and no bounds checking
  return items[0].toUpperCase(); // Will crash if items is null or empty
}

// Issue 3: Optional chaining not used properly
export function processUserData(user: { profile?: { name?: string } } | null) {
  // ❌ VULNERABILITY: Accessing nested properties without checks
  const name = user.profile.name; // Will crash if user or profile is null
  return name.length;
}

// Issue 4: Function parameter not validated
export function formatAddress(address: { street?: string; city?: string } | undefined) {
  // ❌ VULNERABILITY: No undefined check
  return `${address.street}, ${address.city}`; // Will crash if address is undefined
}

// Issue 5: Async function without null handling
export async function fetchUserData(userId: string | null) {
  // ❌ VULNERABILITY: No null check before using
  const response = await fetch(`/api/users/${userId}`);
  return response.json();
}

// Issue 6: Object destructuring without default
export function extractData(data: { value?: number } | null) {
  // ❌ VULNERABILITY: Destructuring null object
  const { value } = data;
  return value * 2; // Will crash if data is null
}

