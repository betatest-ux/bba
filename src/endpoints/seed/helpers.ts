import type { File } from 'payload'

import sharp from 'sharp'

/* ------------------------------------------------------------------ */
/* Lexical rich text builders                                          */
/* ------------------------------------------------------------------ */

type LexicalNode = Record<string, unknown>

export const text = (value: string): LexicalNode => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: value,
  version: 1,
})

export const paragraph = (value: string): LexicalNode => ({
  type: 'paragraph',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  version: 1,
})

export const heading = (value: string, tag: 'h1' | 'h2' | 'h3' | 'h4' = 'h2'): LexicalNode => ({
  type: 'heading',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  tag,
  version: 1,
})

/**
 * Builds a lexical richText value from strings (paragraphs) and/or nodes.
 * Strings starting with "## " / "### " become h2 / h3 headings.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rt = (...blocks: (string | LexicalNode)[]): any => ({
  root: {
    type: 'root',
    children: blocks.map((block) => {
      if (typeof block !== 'string') return block
      if (block.startsWith('### ')) return heading(block.slice(4), 'h3')
      if (block.startsWith('## ')) return heading(block.slice(3), 'h2')
      if (block.startsWith('# ')) return heading(block.slice(2), 'h1')
      return paragraph(block)
    }),
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  },
})

/* ------------------------------------------------------------------ */
/* Placeholder imagery — branded SVG rendered to webp via sharp         */
/* ------------------------------------------------------------------ */

const paletteFor = {
  brick: { bg: '#9E3B32', band: '#8A332B', fg: '#F6F2EA' },
  cotton: { bg: '#ECE6D9', band: '#E0D8C6', fg: '#1F3A5F' },
  gold: { bg: '#D98E32', band: '#C67F28', fg: '#191E24' },
  loom: { bg: '#1F3A5F', band: '#1A3151', fg: '#F6F2EA' },
  moor: { bg: '#3D6B50', band: '#345C44', fg: '#F6F2EA' },
} as const

export type PlaceholderTone = keyof typeof paletteFor

const escapeXML = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Generates a webp placeholder “photo”: brand-toned field with a subtle weave
 * band motif and a label, sized exactly as the real photograph should be.
 */
export const makePlaceholderImage = async (
  label: string,
  width: number,
  height: number,
  tone: PlaceholderTone = 'loom',
): Promise<File> => {
  const colors = paletteFor[tone]
  const bandH = Math.round(height / 12)
  const fontSize = Math.max(18, Math.round(width / 42))

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${colors.bg}"/>
  <g fill="${colors.band}">
    <rect x="0" y="${height - bandH * 3}" width="${width}" height="${bandH}" opacity="0.9"/>
    <rect x="0" y="${height - bandH * 5}" width="${width * 0.66}" height="${bandH}" opacity="0.55"/>
    <rect x="${width * 0.25}" y="${height - bandH * 7}" width="${width * 0.75}" height="${bandH}" opacity="0.35"/>
  </g>
  <text x="${width / 2}" y="${height / 2}" fill="${colors.fg}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle">${escapeXML(label)}</text>
  <text x="${width / 2}" y="${height / 2 + fontSize * 1.6}" fill="${colors.fg}" font-family="Arial, sans-serif" font-size="${Math.round(fontSize * 0.72)}" opacity="0.8" text-anchor="middle">[PLACEHOLDER — replace with a real photo]</text>
</svg>`

  const data = await sharp(Buffer.from(svg)).webp({ quality: 82 }).toBuffer()

  return {
    name: `${label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}.webp`,
    data,
    mimetype: 'image/webp',
    size: data.byteLength,
  }
}

/* ------------------------------------------------------------------ */
/* Placeholder PDFs for the document library                            */
/* ------------------------------------------------------------------ */

/** A minimal, valid one-page PDF containing the given title line. */
export const makePlaceholderPDF = (title: string): File => {
  const safe = title.replace(/[\\()]/g, ' ')
  const content = `BT /F1 18 Tf 60 720 Td (${safe}) Tj 0 -28 Td /F1 11 Tf (PLACEHOLDER document - replace with the real PDF via the admin panel.) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>`,
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]

  let body = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((object, index) => {
    offsets.push(body.length)
    body += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefStart = body.length
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.forEach((offset) => {
    body += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  const data = Buffer.from(body, 'utf8')
  return {
    name: `${safe
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}.pdf`,
    data,
    mimetype: 'application/pdf',
    size: data.byteLength,
  }
}

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

export const daysFromNow = (days: number, hour = 10): string => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}
