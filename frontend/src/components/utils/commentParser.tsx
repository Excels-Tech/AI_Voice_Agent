// Helper function to parse comment content and make URLs and mentions clickable

interface ParsedContentProps {
  content: string;
  onMentionClick?: (username: string) => void;
}

export function ParsedContent({ content, onMentionClick }: ParsedContentProps) {
  // Regular expressions
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g; // [text](url)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const mentionRegex = /(@[\w\s.]+?)(?=\s|$|[,.!?])/g;
  
  const parts: JSX.Element[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  // First, process markdown-style links [text](url)
  let tempContent = content;
  const markdownLinks: { start: number; end: number; text: string; url: string }[] = [];
  let markdownMatch;
  
  while ((markdownMatch = markdownLinkRegex.exec(content)) !== null) {
    markdownLinks.push({
      start: markdownMatch.index,
      end: markdownMatch.index + markdownMatch[0].length,
      text: markdownMatch[1],
      url: markdownMatch[2]
    });
  }

  // Build the content with proper parsing
  let processedContent = content;
  const tokens: Array<{ type: 'text' | 'markdown-link' | 'url' | 'mention'; value: string; start: number; end: number; linkText?: string }> = [];

  // Add markdown links
  markdownLinks.forEach(link => {
    tokens.push({
      type: 'markdown-link',
      value: link.url,
      linkText: link.text,
      start: link.start,
      end: link.end
    });
  });

  // Find plain URLs (not part of markdown links)
  let urlMatch;
  urlRegex.lastIndex = 0;
  while ((urlMatch = urlRegex.exec(content)) !== null) {
    const isPartOfMarkdown = markdownLinks.some(link => 
      urlMatch.index >= link.start && urlMatch.index < link.end
    );
    if (!isPartOfMarkdown) {
      tokens.push({
        type: 'url',
        value: urlMatch[0],
        start: urlMatch.index,
        end: urlMatch.index + urlMatch[0].length
      });
    }
  }

  // Find mentions
  let mentionMatch;
  mentionRegex.lastIndex = 0;
  while ((mentionMatch = mentionRegex.exec(content)) !== null) {
    const isPartOfMarkdown = markdownLinks.some(link => 
      mentionMatch.index >= link.start && mentionMatch.index < link.end
    );
    if (!isPartOfMarkdown) {
      tokens.push({
        type: 'mention',
        value: mentionMatch[0],
        start: mentionMatch.index,
        end: mentionMatch.index + mentionMatch[0].length
      });
    }
  }

  // Sort tokens by start position
  tokens.sort((a, b) => a.start - b.start);

  // Build the final output
  let currentIndex = 0;
  tokens.forEach(token => {
    // Add text before this token
    if (token.start > currentIndex) {
      const textBefore = content.slice(currentIndex, token.start);
      if (textBefore) {
        parts.push(
          <span key={`text-${keyIndex++}`}>{textBefore}</span>
        );
      }
    }

    // Add the token
    if (token.type === 'markdown-link') {
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={token.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {token.linkText}
        </a>
      );
    } else if (token.type === 'url') {
      parts.push(
        <a
          key={`url-${keyIndex++}`}
          href={token.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {token.value}
        </a>
      );
    } else if (token.type === 'mention') {
      const username = token.value.slice(1); // Remove @ symbol
      parts.push(
        <span
          key={`mention-${keyIndex++}`}
          className="text-purple-400 hover:text-purple-300 cursor-pointer font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onMentionClick?.(username);
          }}
        >
          {token.value}
        </span>
      );
    }

    currentIndex = token.end;
  });

  // Add remaining text
  if (currentIndex < content.length) {
    parts.push(
      <span key={`text-${keyIndex++}`}>{content.slice(currentIndex)}</span>
    );
  }

  return <>{parts}</>;
}

// Extract mentions from content
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([\w\s.]+?)(?=\s|$|[,.!?])/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1].trim());
  }

  return mentions;
}