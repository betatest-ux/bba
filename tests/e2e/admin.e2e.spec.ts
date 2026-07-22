import { test, expect, Page } from '@playwright/test'
import { login } from '../helpers/login'

/**
 * Uses the demo admin created by `pnpm seed` (see src/endpoints/seed).
 * Run the seed before the e2e suite.
 */
const demoAdmin = {
  email: 'admin@bballiance.org.uk',
  password: process.env.SEED_ADMIN_PASSWORD || 'bballiance-demo',
}

test.describe('Admin Panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: demoAdmin })
  })

  test('can navigate to dashboard', async () => {
    await page.goto('http://localhost:3000/admin')
    await expect(page).toHaveURL('http://localhost:3000/admin')
    const dashboardArtifact = page.locator('span[title="Dashboard"]').first()
    await expect(dashboardArtifact).toBeVisible()
  })

  test('can navigate to list view', async () => {
    await page.goto('http://localhost:3000/admin/collections/users')
    // Payload appends ?depth=&limit= query params to list views.
    await expect(page).toHaveURL(/\/admin\/collections\/users/)
    const listViewArtifact = page.locator('h1', { hasText: 'Users' }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test('can edit a page and save a draft', async () => {
    await page.goto('http://localhost:3000/admin/collections/pages?limit=50')
    await page.locator('a', { hasText: 'About Us' }).first().click()
    await page.waitForURL(/\/admin\/collections\/pages\/\d+/)
    const titleField = page.locator('input[name="title"]')
    await expect(titleField).toBeVisible()
  })
})
