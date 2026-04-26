import { test, expect } from '@playwright/test'

test.describe('Interview Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/interview')
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('completes the interview flow with AI fallback', async ({ page }) => {
    const startButton = page.getByTestId('interview-start')
    await expect(startButton).toBeDisabled()

    const consentCheckbox = page.getByTestId('consent-checkbox')
    await consentCheckbox.check()
    await expect(startButton).toBeEnabled()
    await startButton.click()

    await expect(page.getByRole('heading', { name: '지원 트랙 선택' })).toBeVisible()
    await page.getByRole('button', { name: '대사관 트랙 (Embassy Track)' }).click()

    const questionContainer = page.getByTestId('next-question')
    await expect(questionContainer).toBeVisible()

    await page.route('/api/interview', async (route) => {
      await route.fulfill({
        status: 500,
        json: { error: 'AI_REQUEST_FAILED' }
      })
    })

    const answerInput = page.getByTestId('answer-input')
    const submitButton = page.getByTestId('answer-submit')
    
    await answerInput.fill('general')
    await submitButton.click()

    await expect(page.getByTestId('ai-fallback-notice')).toBeVisible()
    await expect(questionContainer).toBeVisible()
    
    await expect(page.getByText('다음으로 Degree 항목을 입력해 주세요.')).toBeVisible()
  })
})
