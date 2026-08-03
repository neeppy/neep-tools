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
  }
];
