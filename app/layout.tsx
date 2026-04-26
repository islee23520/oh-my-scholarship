import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'oh-my-scholarship',
  description: 'Milestone 1 bootstrap for the GKS interview web app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
