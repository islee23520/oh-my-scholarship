import { render, screen } from '@testing-library/react'

import HomePage from './page'

describe('HomePage', () => {
  it('shows the app title and placeholder navigation', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', { name: /oh-my-scholarship/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Interview' })).toHaveAttribute(
      'href',
      '/interview',
    )
    expect(screen.getByRole('link', { name: 'Essay drafts' })).toHaveAttribute(
      'href',
      '/interview/drafts',
    )
    expect(
      screen.getByText('이 브라우저에 데이터가 로컬로 저장됩니다 (Milestone 1).'),
    ).toBeInTheDocument()
  })
})
