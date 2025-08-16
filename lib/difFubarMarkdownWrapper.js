/**
 * difFUBAR Markdown Wrapper
 * 
 * Converts difFUBAR plain text output to markdown for consistent formatting
 * across the Datamonkey platform while preserving readability.
 */

/**
 * Convert difFUBAR status message to markdown format
 * @param {string} plainText - The plain text status message
 * @returns {string} - Markdown formatted version
 */
function wrapWithMarkdown(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    return '';
  }

  let markdown = plainText;

  // Convert common patterns to markdown
  
  // 1. Progress indicators: "Progress: 50%" -> "**Progress:** 50%"
  markdown = markdown.replace(/^(Progress|Status|Stage|Phase):\s*/gm, '**$1:** ');
  
  // 2. Section headers: Lines that end with colon become headers
  markdown = markdown.replace(/^([A-Z][^:\n]+):$/gm, '## $1');
  
  // 3. Step indicators: "Step 1:", "Step 2:" -> "### Step 1", "### Step 2"
  markdown = markdown.replace(/^(Step\s+\d+):\s*/gm, '### $1\n');
  
  // 4. Bullet points: Lines starting with "- " or "* " are already markdown
  // No change needed
  
  // 5. Important messages: Lines with "ERROR", "WARNING", "COMPLETE" -> bold
  markdown = markdown.replace(/^.*(ERROR|WARNING|FAILED).*$/gm, '**$&**');
  markdown = markdown.replace(/^.*(COMPLETE|SUCCESS|FINISHED).*$/gm, '**$&**');
  
  // 6. Numerical results: Format key-value pairs
  markdown = markdown.replace(/^([A-Za-z\s]+):\s+(\d+(?:\.\d+)?(?:\s*%?)?)$/gm, '- **$1:** `$2`');
  
  // 7. Time estimates: "ETA: 5 minutes" -> "**ETA:** 5 minutes"
  markdown = markdown.replace(/^(ETA|Elapsed|Duration):\s*/gm, '**$1:** ');
  
  // 8. Parameter summaries: "Grid points: 20" -> "- **Grid points:** `20`"
  markdown = markdown.replace(/^([A-Za-z\s]+points?|iterations?|samples?|threshold):\s+([^,\n]+)/gm, '- **$1:** `$2`');

  return markdown.trim();
}

/**
 * Enhanced wrapper that handles multi-line status messages
 * @param {string} plainText - The plain text status message
 * @returns {string} - Markdown formatted version with proper structure
 */
function enhancedMarkdownWrapper(plainText) {
  if (!plainText || typeof plainText !== 'string') {
    return '';
  }

  // Split into lines and process each section
  const lines = plainText.split('\n');
  const processedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      processedLines.push(''); // Preserve empty lines
      continue;
    }
    
    // Special handling for analysis phases
    let processedLine;
    if (line.match(/^(Initializing|Starting|Processing|Analyzing|Finalizing)/)) {
      processedLine = `## ${line}`;
    } else {
      // Apply the basic wrapper transformations
      processedLine = wrapWithMarkdown(line);
    }
    
    processedLines.push(processedLine);
  }
  
  return processedLines.join('\n');
}

/**
 * Simple wrapper for backward compatibility
 * @param {string} statusMessage - The status message to wrap
 * @returns {string} - Markdown formatted status message
 */
function wrapDifFubarStatus(statusMessage) {
  // For simple status messages, use basic wrapper
  if (!statusMessage || (statusMessage.length < 30 && !statusMessage.includes('\n'))) {
    return wrapWithMarkdown(statusMessage);
  }
  
  // For complex multi-line messages, use enhanced wrapper
  return enhancedMarkdownWrapper(statusMessage);
}

module.exports = {
  wrapWithMarkdown,
  enhancedMarkdownWrapper,
  wrapDifFubarStatus
};