"use client";

import { IconRobot, IconSend, IconUser } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export default function ChatStreamingTestPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm a streaming AI assistant. Type a message and I'll respond with streaming text, just like ChatGPT!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useRealStreaming, setUseRealStreaming] = useState(false); // Toggle for real vs simulated
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (streamingTimeoutRef.current) {
        clearTimeout(streamingTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * STREAMING EFFECT EXPLANATION:
   * 
   * This function creates the ChatGPT-like streaming effect by:
   * 1. Taking the full text we want to display (e.g., "Hello world")
   * 2. Using setInterval to repeatedly add ONE character at a time
   * 3. Each iteration: takes the next character and appends it to the message content
   * 4. React re-renders on each update, making text appear progressively
   * 
   * Example flow:
   * - Start: content = ""
   * - After 20ms: content = "H"
   * - After 40ms: content = "He"
   * - After 60ms: content = "Hel"
   * - After 80ms: content = "Hell"
   * - ... and so on until the full text is displayed
   * 
   * The 20ms delay creates the smooth streaming effect (50 characters per second)
   */
  const streamText = (fullText: string, messageId: string) => {
    // Track which character we're currently displaying
    let currentIndex = 0;
    setIsStreaming(true);

    // setInterval runs a function repeatedly at a fixed time interval
    // In this case, every 20 milliseconds
    const streamInterval = setInterval(() => {
      // Check if we still have more characters to display
      if (currentIndex < fullText.length) {
        // Get the next character from the full text
        const nextChar = fullText[currentIndex];
        
        // Update React state: find the message by ID and append the next character
        // This triggers a re-render, showing the new character
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: msg.content + nextChar, // Append one character
                  isStreaming: true,
                }
              : msg
          )
        );
        
        // Move to the next character for the next iteration
        currentIndex++;
      } else {
        // We've displayed all characters - stop the interval
        clearInterval(streamInterval);
        
        // Mark streaming as complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isStreaming: false } : msg
          )
        );
        setIsStreaming(false);
      }
    }, 20); // 20ms = 50 characters per second (adjust for speed)

    // Store the interval reference so we can clean it up if needed
    streamingTimeoutRef.current = streamInterval as unknown as NodeJS.Timeout;
  };

  /**
   * REAL SERVER-SIDE STREAMING (Like ChatGPT)
   * 
   * This function demonstrates how ChatGPT actually works:
   * 1. Opens a connection to the server
   * 2. Server sends chunks as they're generated (not waiting for full response)
   * 3. Client receives and displays chunks in real-time
   * 
   * Key difference from simulated streaming:
   * - Server processes/generates text incrementally
   * - Client receives data as server generates it
   * - No need to wait for full response before displaying
   */
  const streamFromServer = async (messageId: string) => {
    setIsStreaming(true);
    setIsLoading(true);

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    try {
      // Fetch from our streaming API endpoint
      const response = await fetch('/api/chat-stream', {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stream');
      }

      setIsLoading(false);

      // Read the stream chunk by chunk
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Stream complete
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId ? { ...msg, isStreaming: false } : msg
            )
          );
          setIsStreaming(false);
          break;
        }

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE format: "data: {...}\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.done) {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId ? { ...msg, isStreaming: false } : msg
                  )
                );
                setIsStreaming(false);
                return;
              }

              if (data.char) {
                // Append the character to the message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === messageId
                      ? {
                          ...msg,
                          content: msg.content + data.char,
                          isStreaming: true,
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted, ignore
        return;
      }
      
      console.error('Streaming error:', error);
      const errorMessage = "Sorry, I couldn't fetch the data. Please try again.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: errorMessage, isStreaming: false }
            : msg
        )
      );
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const fetchPostFromAPI = async (): Promise<string> => {
    try {
      // Get a random post ID between 1 and 100
      const randomPostId = Math.floor(Math.random() * 100) + 1;
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/posts/${randomPostId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch post");
      }

      const post: Post = await response.json();
      
      // Format the response nicely
      return `Title: ${post.title}\n\n${post.body}\n\n[Post ID: ${post.id}, User ID: ${post.userId}]`;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);

    // Create assistant message with empty content (will be streamed)
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      isStreaming: true,
    };

    // Add assistant message
    setMessages((prev) => [...prev, assistantMessage]);

    // Clear input
    setInput("");
    setIsLoading(true);

    try {
      if (useRealStreaming) {
        // REAL STREAMING: Server sends chunks as they're generated
        await streamFromServer(assistantMessage.id);
      } else {
        // SIMULATED STREAMING: Fetch full text, then display character by character
        const responseText = await fetchPostFromAPI();
        
        // Start streaming after a short delay
        setTimeout(() => {
          streamText(responseText, assistantMessage.id);
          setIsLoading(false);
        }, 300);
      }
    } catch (error) {
      // Handle error
      const errorMessage = "Sorry, I couldn't fetch the data. Please try again.";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: errorMessage, isStreaming: false }
            : msg
        )
      );
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-rose-950/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Chat Streaming Test
          </h1>
          <p className="text-gray-400 mb-4">
            Experience ChatGPT-like text streaming with data from JSONPlaceholder API
          </p>
          
          {/* Toggle between real and simulated streaming */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!useRealStreaming ? 'text-white font-semibold' : 'text-gray-500'}`}>
              Simulated (Client-side)
            </span>
            <button
              onClick={() => setUseRealStreaming(!useRealStreaming)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                useRealStreaming ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  useRealStreaming ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${useRealStreaming ? 'text-white font-semibold' : 'text-gray-500'}`}>
              Real (Server-side)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {useRealStreaming
              ? 'Server streams chunks as they\'re generated (like ChatGPT)'
              : 'Client displays pre-fetched text character by character'}
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-gray-900/40 backdrop-blur border border-gray-800 rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <IconRobot size={20} className="text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : "bg-gray-800/60 text-gray-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
                    )}
                  </div>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <IconUser size={20} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                className="flex-1 bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={1}
                disabled={isStreaming}
                style={{
                  minHeight: "48px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-xl flex items-center gap-2 transition-all"
              >
                <IconSend size={20} />
                Send
              </button>
            </div>
            {(isStreaming || isLoading) && (
              <p className="text-xs text-gray-500 mt-2 ml-1">
                {isLoading ? "Fetching data from API..." : "AI is typing..."}
              </p>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            This page fetches data from{" "}
            <a
              href="https://jsonplaceholder.typicode.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              JSONPlaceholder API
            </a>{" "}
            and streams the response character by character, just like ChatGPT.
          </p>
        </div>
      </div>
    </div>
  );
}

