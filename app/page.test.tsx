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
  })
})
