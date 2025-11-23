/**
 * TEST COMPONENT: Contains multiple vulnerabilities for testing
 * DO NOT USE IN PRODUCTION
 */

"use client";

import { useState, useEffect } from "react";
import { Button, TextInput } from "@mantine/core";
import { getUserEmail, getFirstItem } from "../utils/nullPointerTest";
import { readFileWithoutClosing } from "../utils/resourceLeakTest";
import { incrementCounterUnsafe, updateUserScoreUnsafe } from "../utils/raceConditionTest";

export function VulnerableComponent() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [items, setItems] = useState<string[] | null>(null);
  const [input, setInput] = useState("");

  // ❌ VULNERABILITY: Using vulnerable functions
  const handleGetEmail = () => {
    try {
      // This will crash if user is null
      const email = getUserEmail(user);
      console.log(email);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGetFirst = () => {
    try {
      // This will crash if items is null or empty
      const first = getFirstItem(items);
      console.log(first);
    } catch (error) {
      console.error(error);
    }
  };

  // ❌ VULNERABILITY: XSS - Directly setting innerHTML with user input
  useEffect(() => {
    if (input) {
      const element = document.getElementById("output");
      if (element) {
        // ❌ VULNERABILITY: XSS - unsanitized user input
        element.innerHTML = input; // Dangerous!
      }
    }
  }, [input]);

  // ❌ VULNERABILITY: Race condition in async operation
  const handleAsyncOperation = async () => {
    // Multiple concurrent calls will cause race conditions
    await incrementCounterUnsafe();
    await incrementCounterUnsafe();
    await incrementCounterUnsafe();
  };

  // ❌ VULNERABILITY: Hardcoded secret (for testing)
  const API_KEY = "FAKE_API_KEY_FOR_TESTING_ONLY"; // ❌ Should use environment variable

  return (
    <div className="p-4">
      <h2>⚠️ Vulnerable Component (Test Only)</h2>
      
      <TextInput
        label="Input (XSS test)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Try: <script>alert('XSS')</script>"
      />
      
      <div id="output" className="mt-4"></div>
      
      <div className="mt-4 space-x-2">
        <Button onClick={handleGetEmail}>Test Null Pointer</Button>
        <Button onClick={handleGetFirst}>Test Array Access</Button>
        <Button onClick={handleAsyncOperation}>Test Race Condition</Button>
      </div>
      
      {/* ❌ VULNERABILITY: Hardcoded secret exposed in component */}
      <div className="mt-4 text-xs text-gray-500">
        API Key: {API_KEY}
      </div>
    </div>
  );
}

