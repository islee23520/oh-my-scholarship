import Link from 'next/link'

import { PROFILE_PRIVACY_NOTE } from '../lib/profile-store'

export default function HomePage() {
  return (
    <main>
      <h1>oh-my-scholarship</h1>
      <p>Milestone 1 bootstrap is ready.</p>
      <p>{PROFILE_PRIVACY_NOTE}</p>
      <nav aria-label="Primary">
        <ul>
          <li>
            <Link href="/interview">Interview</Link>
          </li>
          <li>
            <Link href="/report">Report</Link>
          </li>
          <li>
            <Link href="/proof-export">Proof export</Link>
          </li>
        </ul>
      </nav>
    </main>
  )
}
