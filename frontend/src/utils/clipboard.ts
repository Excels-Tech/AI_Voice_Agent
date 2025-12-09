/**
 * Copy text to clipboard with fallback for environments where Clipboard API is blocked
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Clipboard API failed or blocked by permissions policy, silently continue to fallback
    // This is expected in some environments (e.g., iframes, localhost without HTTPS)
  }

  // Fallback method using textarea
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    textArea.remove();
    
    return successful;
  } catch (err) {
    // Both methods failed, silently fail without logging to avoid console spam
    return false;
  }
}