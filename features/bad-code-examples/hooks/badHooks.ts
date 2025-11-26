/**
 * BAD HOOK EXAMPLES - For Testing Cursor AI Review
 * This file contains intentional React hooks violations
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

// ❌ BAD: Conditional hook usage
export function useConditionalHook(condition: boolean) {
  if (condition) {
    const [state, setState] = useState(0); // ❌ Hook called conditionally
    return state;
  }
  return null;
}

// ❌ BAD: Hook in regular function (not a component or custom hook)
export function regularFunction() {
  const [count, setCount] = useState(0); // ❌ Hook in non-component
  return count;
}

// ❌ BAD: Custom hook that doesn't follow rules
export function useBadHook(deps: any[]) {
  const [value, setValue] = useState(0);
  
  // ❌ BAD: useEffect with wrong dependencies
  useEffect(() => {
    setValue(value + 1);
  }, []); // Missing 'value' in deps
  
  // ❌ BAD: useEffect that should be useMemo
  useEffect(() => {
    const computed = deps.reduce((a, b) => a + b, 0);
    setValue(computed);
  }, [deps]); // Should use useMemo instead
  
  return value;
}

// ❌ BAD: Hook with side effects in render
export function useSideEffectHook() {
  const [data, setData] = useState(null);
  
  // ❌ BAD: Fetching in hook without proper cleanup
  fetch('/api/data')
    .then(r => r.json())
    .then(setData); // Side effect in render
  
  return data;
}

// ❌ BAD: useCallback without dependencies
export function useBadCallback() {
  const [count, setCount] = useState(0);
  
  // ❌ BAD: useCallback missing dependencies
  const increment = useCallback(() => {
    setCount(count + 1); // Uses 'count' but not in deps
  }, []); // Empty deps array
  
  return increment;
}

// ❌ BAD: useMemo for non-expensive computation
export function useUnnecessaryMemo(items: string[]) {
  // ❌ BAD: useMemo for simple operation
  const first = useMemo(() => items[0], [items]);
  
  // ❌ BAD: useMemo with no dependencies
  const constant = useMemo(() => 'constant value', []);
  
  return { first, constant };
}

// ❌ BAD: Multiple useState for related data
export function useMultipleStates() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  // ❌ BAD: Should use single state object
  
  return { firstName, lastName, email, age };
}

// ❌ BAD: useEffect with async function incorrectly
export function useBadAsyncEffect() {
  const [data, setData] = useState(null);
  
  // ❌ BAD: useEffect with async function (missing proper handling)
  useEffect(async () => {
    const result = await fetch('/api/data');
    setData(await result.json());
  }, []);
  
  return data;
}

// ❌ BAD: Hook that returns different types
export function useInconsistentReturn(flag: boolean) {
  const [state, setState] = useState(0);
  
  // ❌ BAD: Returning different types
  if (flag) {
    return state; // number
  }
  return 'string'; // string - inconsistent return type
}

