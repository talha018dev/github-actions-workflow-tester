# What Cursor AI Review Will Catch

Based on the workflow configuration and bad code examples, here's a comprehensive list of issues the Cursor AI review will detect:

## 🔴 Critical Issues

### Security Vulnerabilities
- **SQL Injection**: Unvalidated user input in SQL queries
- **XSS (Cross-Site Scripting)**: Unsafe rendering of user input
- **Command Injection**: Unsafe command execution
- **Path Traversal**: Unsafe file path handling
- **Insecure HTTP Requests**: Using HTTP instead of HTTPS
- **Weak Cryptography**: Insecure hashing algorithms
- **Hardcoded Secrets**: API keys, passwords, tokens in code

### Bugs & Breaking Changes
- **Null Pointer Dereferences**: Accessing properties on null/undefined
- **Resource Leaks**: Unclosed file handles, database connections
- **Race Conditions**: Unsynchronized concurrent operations
- **Memory Leaks**: Uncleared timers, intervals, event listeners
- **Infinite Loops**: Missing loop termination conditions
- **Type Errors**: Runtime type mismatches

## 🟠 Type Safety Issues

### TypeScript Violations
- **`any` Types**: Using `any` instead of proper types
  ```typescript
  function bad(props: any) { } // ❌ Will be caught
  ```
- **Type Assertions**: Excessive use of `as` casting
  ```typescript
  const user = data as any; // ❌ Will be caught
  ```
- **Missing Types**: Functions without return types
- **Implicit Any**: Variables without type annotations
- **Type Narrowing Issues**: Unsafe type narrowing

## ⚛️ React & Hooks Violations

### React Hooks Rules
- **Conditional Hooks**: Hooks called conditionally
  ```typescript
  if (condition) {
    const [state] = useState(0); // ❌ Will be caught
  }
  ```
- **Hooks in Wrong Places**: Hooks in regular functions
- **Missing Dependencies**: useEffect without proper dependencies
  ```typescript
  useEffect(() => {
    setValue(value + 1);
  }, []); // ❌ Missing 'value' - will be caught
  ```
- **Wrong Hook Usage**: useEffect instead of useMemo
- **Async useEffect**: Incorrect async function in useEffect
- **useCallback/useMemo Misuse**: Missing dependencies or unnecessary usage

### React Performance Issues
- **Unnecessary Re-renders**: Missing memoization
- **Inline Functions**: Creating new functions on every render
- **Expensive Computations**: Not using useMemo for heavy calculations
- **Creating Objects in Render**: New object/array on every render

## 🟡 Code Quality Issues

### Best Practices Violations
- **Unused Variables/Imports**: Dead code that should be removed
  ```typescript
  const unusedVar = "never used"; // ❌ Will be caught
  ```
- **Code Duplication**: Repeated code blocks
- **Poor Naming**: Single letter variables, unclear names
  ```typescript
  function x() {
    const a = useState(0); // ❌ Will be caught
  }
  ```
- **Magic Numbers**: Hardcoded values without constants
  ```typescript
  if (count > 5) { } // ❌ Magic number - will be caught
  ```
- **Mixing Concerns**: Business logic mixed with presentation
- **Inconsistent Code Style**: Inconsistent formatting, spacing

### Error Handling
- **Missing Error Handling**: No try-catch blocks
  ```typescript
  const fetchData = async () => {
    const response = await fetch('/api/users'); // ❌ No error handling
  };
  ```
- **Swallowed Errors**: Catching errors but not logging/handling
- **Inconsistent Error Patterns**: Different error handling approaches

### Performance Issues
- **Inefficient Algorithms**: O(n²) when O(n) would work
  ```typescript
  // O(n²) nested loops - ❌ Will be caught
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) { }
  }
  ```
- **Blocking Operations**: Synchronous operations blocking the event loop
- **Unnecessary Computations**: Recalculating on every render

## 🟢 Accessibility Issues

- **Missing ARIA Labels**: Buttons/inputs without accessibility attributes
  ```typescript
  <button onClick={handleClick}>Click me</button> // ❌ No aria-label
  ```
- **Missing Alt Text**: Images without alt attributes
- **Keyboard Navigation**: Missing keyboard event handlers
- **Color Contrast**: Insufficient color contrast ratios
- **Focus Management**: Missing focus indicators

## 🔵 React-Specific Issues

### Component Issues
- **Using Index as Key**: React list keys using array index
  ```typescript
  {items.map((item, index) => (
    <div key={index}>{item}</div> // ❌ Will be caught
  ))}
  ```
- **Conditional Rendering Without Null Checks**: Accessing properties on potentially null objects
- **Inline Styles**: Using inline styles instead of CSS classes
- **Missing PropTypes/TypeScript**: Components without proper typing

### State Management
- **Multiple useState for Related Data**: Should use single state object
  ```typescript
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(''); // ❌ Should be one object
  ```
- **Direct State Mutation**: Mutating state directly instead of using setState
- **Stale Closures**: Using stale values in callbacks

## 🟣 General Code Smells

- **Global Mutable State**: Global variables that can be mutated
  ```typescript
  let globalCounter = 0; // ❌ Will be caught
  ```
- **Callback Hell**: Deeply nested callbacks
- **Mutating Parameters**: Modifying function parameters
- **Dead Code**: Unused functions, unreachable code
- **Inconsistent Return Types**: Functions returning different types
- **Using `var`**: Instead of `const`/`let`

## 📋 Summary

The Cursor AI review will catch **ALL** of these issues and:
1. ✅ List them with file names and line references
2. ✅ Provide specific code examples
3. ✅ Suggest fixes
4. ✅ **Fail the PR check** if any issues are found

The review is configured to be **extremely thorough** and will not pass code with any of these problems.

