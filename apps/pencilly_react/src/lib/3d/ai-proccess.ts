// Function to wait for the code editing to complete via SSE
async function waitForCodeEditing(
  taskId: string,
): Promise<{ content: string } | null> {
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null;

    try {
      const eventSource = new EventSource(
        `http://localhost:8000/api/subscribe/${taskId}`,
      );

      // Set a timeout in case the SSE connection doesn't close properly
      timeout = setTimeout(() => {
        console.warn("Code editing timed out, closing SSE connection");
        eventSource.close();
        reject(new Error("Code editing timed out"));
      }, 120000); // 2 minute timeout

      const cleanup = () => {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        eventSource.close();
      };

      eventSource.addEventListener("start", event => {
        console.log("Code editing started");
      });

      eventSource.addEventListener("complete", event => {
        try {
          const data = JSON.parse((event as MessageEvent).data);
          console.log("Complete event received:", data);

          if (data.content) {
            resolve({ content: data.content });
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error("Error parsing complete event:", error);
          reject(error);
        } finally {
          cleanup();
        }
      });

      eventSource.addEventListener("error", event => {
        console.error("SSE error event received");
        try {
          const data = JSON.parse((event as MessageEvent).data);
          reject(new Error(data.error || "Error editing code"));
        } catch (e) {
          reject(new Error("Unknown error in code editing"));
        } finally {
          cleanup();
        }
      });

      // Handle general error case
      eventSource.onerror = error => {
        console.error("SSE connection error:", error);
        reject(new Error("Error with SSE connection"));
        cleanup();
      };
    } catch (err) {
      console.error("Error setting up SSE connection:", err);
      if (timeout) clearTimeout(timeout);
      reject(err);
    }
  });
}

export function processThreeJsCode(code: string): string {
  let processedCode = code;

  // Extract code from markdown code blocks if present
  const jsPattern = /```javascript\s*\n([\s\S]*?)```/;
  const jsMatch = processedCode.match(jsPattern);

  if (jsMatch && jsMatch[1]) {
    processedCode = jsMatch[1];
  } else {
    // Try to find any code block with or without language specification
    const codePattern = /```(?:\w*\s*)?\n([\s\S]*?)```/;
    const codeMatch = processedCode.match(codePattern);
    if (codeMatch && codeMatch[1]) {
      processedCode = codeMatch[1];
    } else {
      // If no markdown code blocks found, try to find script tags
      const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/;
      const scriptMatch = processedCode.match(scriptPattern);
      if (scriptMatch && scriptMatch[1]) {
        processedCode = scriptMatch[1];
      }
    }
  }

  // Process the code to adapt to the non-ES modules environment
  processedCode = processedCode.replace(
    /^import\s+.*?from\s+['"].*?['"];?\s*$/gm,
    "",
  );
  processedCode = processedCode.replace(
    /^import\s+\*\s+as\s+.*?\s+from\s+['"].*?['"];?\s*$/gm,
    "",
  );
  processedCode = processedCode.replace(/^import\s+['"].*?['"];?\s*$/gm, "");
  processedCode = processedCode.replace(
    /^const\s+.*?\s*=\s*require\(['"].*?['"]\);?\s*$/gm,
    "",
  );

  processedCode = processedCode.replace(
    /import\s+\*\s+as\s+THREE\s+from\s+['"]three['"];?\s*/g,
    "",
  );
  processedCode = processedCode.replace(
    /import\s+{\s*OrbitControls\s*}\s+from\s+['"]three\/addons\/controls\/OrbitControls\.js['"];?\s*/g,
    "",
  );
  processedCode = processedCode.replace(
    /import\s+{\s*[^}]*\s*}\s+from\s+['"]three['"];?\s*/g,
    "",
  );
  processedCode = processedCode.replace(
    /import\s+THREE\s+from\s+['"]three['"];?\s*/g,
    "",
  );

  processedCode = processedCode.replace(
    /THREE\.OrbitControls/g,
    "OrbitControls",
  );

  return processedCode;
}
