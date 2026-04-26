import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PROFILE_STORAGE_KEY } from '@/lib/profile-store'

import DraftsPage from './page'

const createStorageMock = () => {
  const values = new Map<string, string>()

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

const readStoredProfile = () => {
  const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

describe('DraftsPage', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createStorageMock(),
      configurable: true,
      writable: true,
    })
    vi.restoreAllMocks()
  })

  it('does not persist a generated draft before accept is clicked', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          draftText: '초안 본문',
          language: 'korean',
        }),
      }),
    )

    render(<DraftsPage />)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByLabelText('User bullets'), {
      target: { value: '- 지원 동기\n- 데이터 봉사활동' },
    })
    fireEvent.click(screen.getByTestId('generate-form2-draft'))

    await screen.findByText('초안 — 반드시 사용자가 검토/수정해야 함')
    expect(readStoredProfile()).toBeNull()

    fireEvent.click(screen.getByTestId('accept-draft'))

    await waitFor(() => {
      expect(readStoredProfile()?.profile.form2PersonalStatement).toBe('초안 본문')
    })
  })

  it('shows a retry and fallback prompt when AI generation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          message: 'Failed to generate the requested essay draft.',
        }),
      }),
    )

    render(<DraftsPage />)

    fireEvent.click(screen.getByRole('checkbox'))
    fireEvent.change(screen.getByLabelText('User bullets'), {
      target: { value: '- 한국어 향상\n- AI 정책 연구' },
    })
    fireEvent.click(screen.getByTestId('generate-form3-draft'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to generate the requested essay draft.',
    )
    expect(screen.getByTestId('draft-fallback-prompt')).toHaveTextContent(
      'AI 초안 생성에 실패했습니다.',
    )
  })
})
