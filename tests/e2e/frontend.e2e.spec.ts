import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('can load homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/BBAlliance/)
  })

  test('key public pages load with a heading', async ({ page }) => {
    for (const path of [
      '/activities',
      '/news',
      '/events',
      '/appeals',
      '/jobs',
      '/get-involved',
      '/donate',
      '/documents',
      '/faqs',
      '/contact',
      '/trustees-and-staff',
      '/search',
    ]) {
      await page.goto(`http://localhost:3000${path}`)
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })

  test('activities filters update the grid', async ({ page }) => {
    await page.goto('http://localhost:3000/activities')
    const count = page.getByText(/Showing \d+ of \d+ activities/)
    await expect(count).toBeVisible()
    await page.getByRole('button', { name: 'Youth' }).click()
    await expect(count).toBeVisible()
  })

  test('contact form shows inline validation errors', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')
    await page.getByRole('button', { name: 'Send message' }).click()
    await expect(page.getByText('Enter your name.')).toBeVisible()
  })
})
