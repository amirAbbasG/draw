/**
 * Normalizes Mermaid code retrieved from localStorage
 * Fixes escaped newlines and other common storage issues
 */
export function normalizeMermaidCode(code: string) {
  if (!code || typeof code !== "string") {
    console.warn("Invalid Mermaid code provided");
    return "";
  }

  let normalized = code;

  // Replace escaped newlines with actual newlines
  normalized = normalized.replace(/\\r\\n/g, "\n");
  normalized = normalized.replace(/\\n/g, "\n");
  normalized = normalized.replace(/\\r/g, "\n");

  // Replace literal \r\n sequences (in case of double escaping)
  normalized = normalized.replace(/\r\n/g, "\n");
  normalized = normalized.replace(/\r/g, "\n");

  // Fix escaped quotes that might have been double-escaped
  normalized = normalized.replace(/\\"/g, '"');
  normalized = normalized.replace(/\\'/g, "'");

  // Remove any leading/trailing whitespace
  normalized = normalized.trim();

  // Remove extra blank lines (more than 2 consecutive newlines)
  normalized = normalized.replace(/\n{3,}/g, "\n\n");

  // Ensure proper indentation is preserved
  // Split into lines and clean each line
  normalized = normalized
    .split("\n")
    .map(line => line.trimEnd()) // Remove trailing spaces but keep leading
    .join("\n");

  return normalized;
}

/**
 * Validates basic Mermaid syntax
 */
export function validateMermaidCode(code: string) {
  const normalized = normalizeMermaidCode(code);

  if (!normalized) {
    return { valid: false, error: "Empty code" };
  }

  // Check if it starts with a valid Mermaid diagram type
  const validTypes = [
    "flowchart",
    "graph",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "journey",
    "gantt",
    "pie",
    "gitGraph",
    "mindmap",
    "timeline",
    "quadrantChart",
  ];

  const firstLine = normalized.split("\n")[0].trim();
  const hasValidType = validTypes.some(type =>
    firstLine.toLowerCase().startsWith(type.toLowerCase()),
  );

  if (!hasValidType) {
    return {
      valid: false,
      error:
        "Invalid diagram type. Must start with a valid Mermaid diagram type.",
    };
  }

  return { valid: true, code: normalized };
}
