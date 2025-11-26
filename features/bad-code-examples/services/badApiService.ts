/**
 * BAD API SERVICE EXAMPLES - For Testing Cursor AI Review
 * This file contains intentional API/service layer bad practices
 */

// ❌ BAD: No base URL configuration, hardcoded URLs everywhere
export async function fetchUserData(userId: string) {
  const response = await fetch(`http://localhost:3000/api/users/${userId}`);
  return response.json(); // ❌ No error handling, no response status check
}

// ❌ BAD: Exposing sensitive data in URLs
export async function login(username: string, password: string) {
  const url = `https://api.example.com/login?username=${username}&password=${password}`;
  return fetch(url); // ❌ Credentials in URL, not POST body
}

// ❌ BAD: No request timeout, can hang forever
export async function slowApiCall() {
  const response = await fetch('https://slow-api.example.com/data');
  return response.json(); // ❌ No timeout, no abort controller
}

// ❌ BAD: Race condition - multiple calls can overwrite each other
let currentUser: any = null;
export async function loadUser(id: string) {
  const user = await fetch(`/api/users/${id}`).then(r => r.json());
  currentUser = user; // ❌ Race condition if called multiple times
  return user;
}

// ❌ BAD: No caching, fetches same data repeatedly
export async function getProductDetails(productId: string) {
  return fetch(`/api/products/${productId}`).then(r => r.json());
  // ❌ No caching, will fetch same product multiple times
}

// ❌ BAD: Mixing API calls with business logic
export async function processOrder(orderId: string) {
  const order = await fetch(`/api/orders/${orderId}`).then(r => r.json());
  
  // ❌ Business logic mixed with API call
  if (order.total > 1000) {
    order.discount = 0.1;
  }
  
  // ❌ Another API call in the same function
  await fetch('/api/notify', {
    method: 'POST',
    body: JSON.stringify({ orderId })
  });
  
  return order;
}

// ❌ BAD: No retry logic for transient failures
export async function criticalApiCall() {
  const response = await fetch('/api/critical-endpoint');
  if (!response.ok) {
    throw new Error('Failed'); // ❌ No retry, fails immediately
  }
  return response.json();
}

// ❌ BAD: Inconsistent error handling
export async function inconsistentErrors() {
  try {
    const user = await fetch('/api/user').then(r => r.json());
    const posts = await fetch('/api/posts').then(r => r.json()); // ❌ No try-catch
    return { user, posts };
  } catch (error) {
    console.log(error); // ❌ Just logging, not handling
    return null; // ❌ Returning null instead of proper error
  }
}

// ❌ BAD: No request cancellation
export async function searchUsers(query: string) {
  // ❌ Previous requests not cancelled, can cause stale data
  return fetch(`/api/search?q=${query}`).then(r => r.json());
}

// ❌ BAD: No request deduplication
export async function fetchUser(id: string) {
  // ❌ Same request can be made multiple times simultaneously
  return fetch(`/api/users/${id}`).then(r => r.json());
}

// ❌ BAD: No request/response interceptors or middleware
export async function apiCall(endpoint: string) {
  // ❌ No authentication headers
  // ❌ No request logging
  // ❌ No response transformation
  return fetch(endpoint).then(r => r.json());
}

// ❌ BAD: Using any types, no type safety
export async function typedApiCall(): Promise<any> {
  const data = await fetch('/api/data').then(r => r.json());
  return data.someProperty.nested.value; // ❌ No type checking, can crash
}

// ❌ BAD: No request validation
export async function createUser(userData: any) {
  // ❌ No validation of userData before sending
  return fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData) // ❌ Could send invalid data
  });
}

// ❌ BAD: Memory leak - event listeners not cleaned up
export function setupWebSocket() {
  const ws = new WebSocket('ws://localhost:8080');
  
  ws.onmessage = (event) => {
    console.log(event.data);
    // ❌ No cleanup, WebSocket never closed
  };
  
  return ws;
}

// ❌ BAD: No pagination handling
export async function getAllUsers() {
  // ❌ Fetches all users at once, no pagination
  return fetch('/api/users').then(r => r.json());
}

// ❌ BAD: Synchronous operations blocking the event loop
export function syncApiCall() {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', '/api/data', false); // ❌ Synchronous, blocks UI
  xhr.send();
  return JSON.parse(xhr.responseText);
}

// ❌ BAD: No request queuing or rate limiting
export async function spamApi() {
  // ❌ Can spam the API with unlimited requests
  for (let i = 0; i < 1000; i++) {
    fetch(`/api/endpoint?id=${i}`);
  }
}

// ❌ BAD: Hardcoded API keys in code
const API_KEY = 'sk-1234567890abcdef'; // ❌ Exposed in source code
export async function authenticatedCall() {
  return fetch('/api/protected', {
    headers: {
      'Authorization': `Bearer ${API_KEY}` // ❌ API key in code
    }
  });
}

// ❌ BAD: No response transformation layer
export async function rawApiCall() {
  const response = await fetch('/api/data');
  const data = await response.json();
  
  // ❌ Transforming response inline, should be in separate layer
  return {
    id: data.user_id, // ❌ Inconsistent naming
    name: data.user_name,
    email: data.user_email_address
  };
}

// ❌ BAD: No request/response logging for debugging
export async function silentApiCall() {
  // ❌ No logging, hard to debug issues
  return fetch('/api/data').then(r => r.json());
}

// ❌ BAD: Using deprecated fetch options
export async function deprecatedCall() {
  return fetch('/api/data', {
    method: 'GET',
    cache: 'only-if-cached', // ❌ Deprecated option
    credentials: 'same-origin' // ❌ Should use 'include' or 'omit'
  });
}

// ❌ BAD: No Content-Type headers
export async function postData(data: any) {
  return fetch('/api/data', {
    method: 'POST',
    body: JSON.stringify(data) // ❌ Missing Content-Type header
  });
}

// ❌ BAD: Ignoring CORS errors
export async function corsCall() {
  try {
    return await fetch('https://different-origin.com/api');
  } catch (error) {
    // ❌ Silently ignoring CORS errors
    return null;
  }
}

// ❌ BAD: No request cancellation on component unmount
export function useApiData(id: string) {
  let cancelled = false;
  
  fetch(`/api/data/${id}`).then(r => r.json()).then(data => {
    if (!cancelled) {
      // ❌ No proper cleanup mechanism
      console.log(data);
    }
  });
  
  return () => { cancelled = true; }; // ❌ Weak cancellation pattern
}

