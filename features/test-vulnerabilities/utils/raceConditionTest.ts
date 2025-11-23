/**
 * TEST FILE: Race Condition Issues
 * This file contains intentional vulnerabilities for testing CodeQL
 * DO NOT USE IN PRODUCTION
 */

// Issue 1: Shared state modification without synchronization
let counter = 0;

export async function incrementCounterUnsafe() {
  // ❌ VULNERABILITY: Race condition - multiple async operations modify shared state
  const current = counter;
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async operation
  counter = current + 1; // Lost update if called concurrently
  return counter;
}

// Issue 2: Array modification during iteration
export function processItemsUnsafe(items: string[]) {
  // ❌ VULNERABILITY: Modifying array while iterating
  items.forEach((item, index) => {
    if (item.startsWith('remove')) {
      items.splice(index, 1); // Race condition: array modified during iteration
    }
  });
  return items;
}

// Issue 3: Non-atomic read-modify-write
let balance = 100;

export async function withdrawUnsafe(amount: number) {
  // ❌ VULNERABILITY: Non-atomic operation - check and modify not synchronized
  if (balance >= amount) {
    await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async delay
    balance -= amount; // Race condition: balance may have changed
    return balance;
  }
  throw new Error('Insufficient funds');
}

// Issue 4: Multiple async operations on shared object
interface User {
  id: string;
  score: number;
}

const userCache = new Map<string, User>();

export async function updateUserScoreUnsafe(userId: string, points: number) {
  // ❌ VULNERABILITY: Race condition - concurrent updates may overwrite each other
  const user = userCache.get(userId) || { id: userId, score: 0 };
  await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async operation
  user.score += points;
  userCache.set(userId, user); // Lost update if called concurrently
  return user.score;
}

// Issue 5: File write race condition
import * as fs from 'fs';

export async function appendToFileUnsafe(filename: string, data: string) {
  // ❌ VULNERABILITY: Race condition - multiple writes may interfere
  const existing = fs.existsSync(filename) 
    ? fs.readFileSync(filename, 'utf8') 
    : '';
  await new Promise(resolve => setTimeout(resolve, 5)); // Simulate async delay
  fs.writeFileSync(filename, existing + data); // May overwrite concurrent writes
}

// Issue 6: Promise race condition
let requestCount = 0;

export async function makeRequestUnsafe(url: string) {
  // ❌ VULNERABILITY: Shared counter modified concurrently
  requestCount++;
  const currentCount = requestCount;
  
  try {
    const response = await fetch(url);
    // requestCount may have been modified by other concurrent calls
    console.log(`Request ${currentCount} completed`);
    return response;
  } catch (error) {
    requestCount--; // Race condition: decrement may not match increment
    throw error;
  }
}

// Issue 7: Object property modification race condition
const sharedState = {
  value: 0,
  processing: false
};

export async function processValueUnsafe(newValue: number) {
  // ❌ VULNERABILITY: Check-then-act race condition
  if (!sharedState.processing) {
    sharedState.processing = true;
    await new Promise(resolve => setTimeout(resolve, 10));
    sharedState.value = newValue;
    sharedState.processing = false;
    // Another call may have started processing during the await
  }
  return sharedState.value;
}

