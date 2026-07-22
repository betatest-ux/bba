/**
 * Flattens a lexical editor state to plain text — used for search snippets,
 * FAQ JSON-LD, RSS descriptions and reading-time estimates.
 */
type LexicalNode = {
  children?: LexicalNode[]
  text?: string
  type?: string
}

const walk = (node: LexicalNode, parts: string[]): void => {
  if (typeof node.text === 'string') parts.push(node.text)
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, parts)
    // Paragraph-level nodes get a separator so words don't run together.
    if (node.type && node.type !== 'text') parts.push('\n')
  }
}

export const lexicalToPlainText = (data: unknown): string => {
  const root = (data as { root?: LexicalNode } | null | undefined)?.root
  if (!root) return ''
  const parts: string[] = []
  walk(root, parts)
  return parts.join(' ').replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim()
}
