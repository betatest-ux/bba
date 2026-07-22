import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Automated WCAG 2.2 A/AA scan of the key public pages with axe-core.
 * Serious/critical violations fail the build.
 */
const pages = [
  '/',
  '/activities',
  '/news',
  '/contact',
  '/trustees-and-staff',
  '/faqs',
  '/donate',
  '/jobs',
]

for (const path of pages) {
  test(`axe: ${path} has no serious or critical violations`, async ({ page }) => {
    await page.goto(`http://localhost:3000${path}`)
    await page.waitForLoadState('networkidle')

    // @axe-core/playwright bundles its own playwright-core Page type, which
    // is structurally identical but nominally different from ours.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await new AxeBuilder({ page: page as any })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze()

    const serious = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    )

    expect(
      serious,
      serious
        .map(
          (violation) =>
            `${violation.id} (${violation.impact}): ${violation.help} → ${violation.nodes
              .slice(0, 3)
              .map((node) => node.target.join(' '))
              .join('; ')}`,
        )
        .join('\n'),
    ).toEqual([])
  })
}
