import { expect, test } from '@playwright/test'

test('home and placeholder routes load', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'oh-my-scholarship' })).toBeVisible()

  await page.goto('/interview')
  await expect(page.getByRole('heading', { name: '인터뷰 시작' })).toBeVisible()

  await page.goto('/report')
  await expect(page.getByRole('heading', { name: 'Milestone 1 DOCX proof 준비 상태' })).toBeVisible()

  await page.goto('/proof-export')
  await expect(page.getByRole('heading', { name: 'Proof export' })).toBeVisible()
})
