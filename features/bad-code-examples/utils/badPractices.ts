/**
 * BAD CODE EXAMPLES - For Testing Cursor AI Review
 * This file contains intentional bad practices that Cursor AI should catch
 */

// ❌ BAD: Global mutable state
let globalCounter = 0;

// ❌ BAD: Function with side effects and no return type
export function doSomething(input: any) {
  globalCounter++;
  console.log(input);
  // No return statement, implicit undefined
}

// ❌ BAD: Deeply nested callbacks (callback hell)
export function nestedCallbacks() {
  fetch('/api/users', (users) => {
    users.forEach((user: any) => {
      fetch(`/api/posts/${user.id}`, (posts) => {
        posts.forEach((post: any) => {
          fetch(`/api/comments/${post.id}`, (comments) => {
            comments.forEach((comment: any) => {
              console.log(comment.text);
            });
          });
        });
      });
    });
  });
}

// ❌ BAD: Mutating function parameters
export function mutateParams(obj: { count: number }) {
  obj.count = obj.count + 1; // Mutating parameter
  return obj;
}

// ❌ BAD: Inconsistent error handling
export async function inconsistentErrors() {
  try {
    const data1 = await fetch('/api/1'); // No error handling
    const data2 = await fetch('/api/2').catch(() => null); // Different pattern
    const data3 = await fetch('/api/3'); // No error handling again
    return { data1, data2, data3 };
  } catch (e) {
    // ❌ BAD: Swallowing error, no logging
    return null;
  }
}

// ❌ BAD: Duplicate code
export function calculateTotal1(items: number[]) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i];
  }
  return total;
}

export function calculateTotal2(items: number[]) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total = total + items[i]; // Exact duplicate
  }
  return total;
}

// ❌ BAD: Using var instead of const/let
export function oldSchool() {
  var x = 1;
  if (true) {
    var x = 2; // Same variable, hoisted
  }
  return x;
}

// ❌ BAD: Type assertions everywhere (defeating TypeScript)
export function typeAssertions(data: unknown) {
  const user = data as any;
  const name = (user as { name: string }).name;
  const age = (user as { age: number }).age;
  return { name, age };
}

// ❌ BAD: No input validation
export function noValidation(email: string, password: string) {
  // Directly using inputs without validation
  const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  return query; // SQL injection risk
}

// ❌ BAD: Synchronous blocking operations
export function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Blocking for 5 seconds
  }
  return 'done';
}

// ❌ BAD: Inefficient algorithm
export function inefficientSearch(arr: number[], target: number) {
  // O(n²) when O(n) would work
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] + arr[j] === target) {
        return [i, j];
      }
    }
  }
  return null;
}

// ❌ BAD: Hardcoded values
export function hardcodedValues() {
  if (new Date().getHours() > 17) { // Magic number
    return 'evening';
  }
  if (new Date().getHours() < 9) { // Magic number
    return 'morning';
  }
  return 'day';
}

// ❌ BAD: Unused imports and dead code
import { useState, useEffect, useCallback, useMemo } from 'react';

export function unusedCode() {
  const [state] = useState(0);
  // useEffect, useCallback, useMemo never used
  
  function neverCalled() {
    return 'dead code';
  }
  
  return <div>{state}</div>;
}

// ❌ BAD: Mixing concerns
export function mixedConcerns(userId: string) {
  // Database query
  const user = { id: userId, name: 'John' };
  
  // Business logic
  const discount = user.id.length > 5 ? 0.1 : 0.05;
  
  // Formatting
  const formatted = `User: ${user.name}, Discount: ${(discount * 100).toFixed(0)}%`;
  
  // API call
  fetch('/api/log', { method: 'POST', body: formatted });
  
  return formatted;
}

// ❌ BAD: Inconsistent code style
export function inconsistentStyle(  param1: string,param2:number,param3:boolean){
if(param1==='test'){
return {a:param2,b:param3}
}else{
return null
}
}

