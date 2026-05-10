import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Plan by Appetite',
  description: 'Projectplanning, uren en rapportage voor Appetite workflows.',
  applicationName: 'Plan by Appetite',
  appleWebApp: {
    capable: true,
    title: 'Plan',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B2038',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl-BE">
      <body>{children}</body>
    </html>
  )
}
