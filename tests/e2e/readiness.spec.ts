import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/passenger-experience/', '/crew-recognition/', '/service-recovery/', '/engagement/', '/ancillary-revenue/', '/integration/', '/pilot/']

for (const route of publicRoutes) test(`${route} has no serious accessibility or overflow defects`, async ({ page }) => {
  await page.goto(route)
  await expect(page.locator('main')).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
  const material = results.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')
  expect(material, material.map(item => `${item.id}: ${item.help}`).join('\n')).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
})

test('executive carousel exposes all product steps and one pilot destination', async ({ page }) => {
  await page.goto('/product-app/')
  const tabs = page.getByRole('tab')
  await expect(tabs).toHaveCount(12)
  for (let index = 0; index < 12; index++) {
    await tabs.nth(index).click({ force: true })
    await expect(tabs.nth(index)).toHaveAttribute('aria-selected', 'true')
  }
  await expect(page.getByRole('link', { name: /request a pilot/i }).first()).toHaveAttribute('href', '/pilot/#contact')
})

test('pilot form is labelled, first-party and keyboard reachable', async ({ page }) => {
  await page.goto('/pilot/#contact')
  await expect(page.getByLabel('Work email')).toBeVisible()
  await expect(page.getByLabel('Name', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Cruise line or company')).toBeVisible()
  await expect(page.getByRole('button', { name: /request a pilot conversation/i })).toBeEnabled()
  await expect(page.locator('form.pilot-contact-form')).not.toHaveAttribute('action', /formsubmit/i)
  await page.keyboard.press('Tab')
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('BODY')
})

test('offline shell keeps a previously visited public page available', async ({ page, context }) => {
  await page.goto('/?offline-test=1')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.waitForTimeout(500)
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('main')).toBeVisible()
  await context.setOffline(false)
})
