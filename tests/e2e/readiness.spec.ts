import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const publicRoutes = [
  '/',
  '/passenger-experience/',
  '/crew-recognition/',
  '/service-recovery/',
  '/engagement/',
  '/ancillary-revenue/',
  '/integration/',
  '/pilot/',
  '/all-inclusive-resorts/',
  '/resort-live-demo/',
  '/resort-pilot/',
  '/resort-guest-engagement-software/',
  '/hotel-service-recovery-software/',
  '/resort-upselling-software/',
  '/hotel-ancillary-revenue-software/',
  '/resort-experience-discovery/',
  '/hotel-guest-rating-software/',
]

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

test('resort pillar contains no unapproved hotel-chain logos or affiliations', async ({ page }) => {
  await page.goto('/all-inclusive-resorts/')
  const body = await page.locator('body').innerText()
  for (const unapprovedBrand of ['Atlantis', 'RIU', 'Barceló', 'Iberostar', 'Secrets']) {
    expect(body).not.toContain(unapprovedBrand)
  }
  await expect(page.getByText('BUILT FOR ALL-INCLUSIVE RESORTS')).toBeVisible()
})

test('resort rating demo uses the fixed 10-question public flow', async ({ page }) => {
  await page.goto('/resort-live-demo/')
  await page.getByRole('button', { name: '5-minute rating' }).click()

  for (let question = 0; question < 10; question++) {
    await expect(page.getByText(new RegExp(`QUESTION ${question + 1} OF 10`))).toBeVisible()
    const scoreButtons = page.getByRole('button', { name: /Rate \d+ out of 10/ })
    await expect(scoreButtons).toHaveCount(10)
    await page.getByRole('button', { name: 'Rate 8 out of 10' }).click()
    await page.getByRole('button', { name: question === 9 ? 'Add two short comments' : 'Next question' }).click()
  }

  const good = page.getByLabel(/What was good\?/) 
  const improve = page.getByLabel(/What could be improved\?/) 
  await expect(good).toHaveAttribute('maxlength', '400')
  await expect(improve).toHaveAttribute('maxlength', '400')
  await good.fill('Warm staff, beautiful pool and excellent breakfast.')
  await improve.fill('Dinner waiting time could be shorter.')
  await page.getByRole('button', { name: /submit & publish demo rating/i }).click()
  await expect(page.getByText('Rating published. The resort can still act while you are here.')).toBeVisible()
  await expect(page.getByText(/cannot selectively hold back a rating because it is poor/i)).toBeVisible()
})

test('resort rating copy states questions are standard and ratings cannot be suppressed', async ({ page }) => {
  await page.goto('/hotel-guest-rating-software/')
  await expect(page.getByText(/10 standard guest pain-point questions/i).first()).toBeVisible()
  await expect(page.getByText(/participating hotels do not choose or rewrite them/i).first()).toBeVisible()
  await expect(page.getByText(/cannot selectively suppress or hold back poor ratings/i).first()).toBeVisible()
})

test('resort pilot form uses the existing first-party enquiry endpoint', async ({ page }) => {
  await page.goto('/resort-pilot/#contact')
  await expect(page.getByLabel('Work email')).toBeVisible()
  await expect(page.getByLabel('Property or hotel group')).toBeVisible()
  await expect(page.locator('form.resort-contact-form')).not.toHaveAttribute('action', /formsubmit/i)
  await expect(page.getByRole('button', { name: /request a live demo or pilot/i })).toBeEnabled()
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
