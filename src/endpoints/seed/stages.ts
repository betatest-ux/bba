/**
 * The ordered list of seed stages. Kept free of server-only imports so the
 * admin SeedButton (a client component) can drive the stages one request at a
 * time — a single request doing everything exceeds serverless time limits.
 */
export const seedStageList = [
  { key: 'reset', label: 'Clearing existing content' },
  { key: 'images-1', label: 'Generating placeholder images (1 of 2)' },
  { key: 'images-2', label: 'Generating placeholder images (2 of 2)' },
  { key: 'content', label: 'Creating people, projects and stories' },
  { key: 'more-content', label: 'Creating news, events, appeals and documents' },
  { key: 'pages', label: 'Building pages' },
  { key: 'globals', label: 'Configuring site settings' },
] as const

export type SeedStageKey = (typeof seedStageList)[number]['key']
