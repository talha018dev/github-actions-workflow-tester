import { NextRequest } from 'next/server';

/**
 * REAL STREAMING API ROUTE
 * 
 * This demonstrates how ChatGPT actually works:
 * - Server generates/processes text incrementally
 * - Sends chunks as they're ready (not waiting for full response)
 * - Client receives and displays chunks progressively
 * 
 * Uses Server-Sent Events (SSE) for streaming
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId') || String(Math.floor(Math.random() * 100) + 1);

  // Create a ReadableStream for streaming
  const stream = new ReadableStream({
    async start(controller) {
      console.log('🚀 - GET - controller:', controller)
      const encoder = new TextEncoder();

      try {
        // Fetch the post from JSONPlaceholder
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${postId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }

        const post = await response.json();
        
        // Format the response
        const fullText = `Title: ${post.title}\n\n${post.body}\n\n[Post ID: ${post.id}, User ID: ${post.userId}]`;

        // Simulate processing/generating text incrementally
        // In real ChatGPT, this would be the AI model generating tokens
        for (let i = 0; i < fullText.length; i++) {
          const char = fullText[i];
          
          // Send each character as a chunk
          // Format: "data: [character]\n\n" (SSE format)
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ char, done: false })}\n\n`)
          );

          // Simulate processing delay (like AI token generation time)
          // In real ChatGPT, this would be the actual model inference time
          await new Promise(resolve => setTimeout(resolve, 20));
        }

        // Send completion signal
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
        );
        
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  // Return streaming response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

