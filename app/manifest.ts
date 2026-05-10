import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Plan by Appetite',
    short_name: 'Plan',
    description: 'Projectplanning, uren en rapportage voor Appetite workflows.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F1EA',
    theme_color: '#0B2038',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/maskable-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
