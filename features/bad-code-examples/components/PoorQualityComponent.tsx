/**
 * BAD CODE EXAMPLES - For Testing Cursor AI Review
 * This file contains intentional code quality issues that Cursor AI should catch
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@mantine/core";

// ❌ BAD: Using 'any' type everywhere
export function BadComponent(props: any) {
  // ❌ BAD: Unused variable
  const unusedVar = "never used";
  
  // ❌ BAD: State with wrong type
  const [data, setData] = useState<any>(null);
  const [count, setCount] = useState(0);
  
  // ❌ BAD: Missing dependency array, will cause infinite re-renders
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
    console.log('rendered');
  }); // Missing dependency array!
  
  // ❌ BAD: Inline function in render (creates new function on every render)
  const handleClick = () => {
    setCount(count + 1); // ❌ BAD: Direct state mutation pattern
    console.log(count); // ❌ BAD: Will log stale value
  };
  
  // ❌ BAD: No error handling
  const fetchData = async () => {
    const response = await fetch('/api/users');
    const users = await response.json();
    return users.map((u: any) => u.name.toUpperCase()); // ❌ BAD: No null check
  };
  
  // ❌ BAD: Magic numbers
  if (count > 5) {
    return <div>Too many clicks</div>;
  }
  
  // ❌ BAD: Inline styles instead of Tailwind classes
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff' }}>
      <h1>Bad Component</h1>
      {/* ❌ BAD: No accessibility attributes */}
      <button onClick={handleClick}>Click me</button>
      {/* ❌ BAD: Using index as key */}
      {data?.map((item: any, index: number) => (
        <div key={index}>{item}</div>
      ))}
      {/* ❌ BAD: Conditional rendering without null check */}
      <div>{data.name}</div>
    </div>
  );
}

// ❌ BAD: Component with memory leak
export function LeakyComponent() {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // ❌ BAD: Timer never cleared
    const id = setInterval(() => {
      console.log('tick');
    }, 1000);
    setTimer(id);
    // Missing cleanup!
  }, []);
  
  return <div>Leaky Component</div>;
}

// ❌ BAD: Poor naming and structure
export function x() {
  const a = useState(0);
  const b = () => {
    a[1](a[0] + 1);
  };
  return <button onClick={b}>{a[0]}</button>;
}

// ❌ BAD: Unnecessary re-renders
export function InefficientComponent({ items }: { items: string[] }) {
  const [filter, setFilter] = useState('');
  
  // ❌ BAD: Expensive computation on every render
  const filtered = items
    .filter(item => item.includes(filter))
    .map(item => item.toUpperCase())
    .sort()
    .reverse();
  
  // ❌ BAD: Creating new object on every render
  const config = {
    filter,
    items: filtered
  };
  
  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value)} />
      {filtered.map((item, i) => (
        <div key={i}>{item}</div>
      ))}
    </div>
  );
}

