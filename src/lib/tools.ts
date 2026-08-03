export interface Tool {
  slug: string;
  title: string;
  description: string;
}

export const tools: Tool[] = [
  {
    slug: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Format, validate, and minify JSON.'
  },
  {
    slug: 'text-diff',
    title: 'Text Diff',
    description: 'Compare two blocks of text with line and word-level highlights.'
  },
  {
    slug: 'hash-generator',
    title: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, and bcrypt hashes with optional secrets and rounds.'
  }
];
