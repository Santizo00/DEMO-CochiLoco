import type { Metadata, Viewport } from 'next'
import { Inter, Oswald } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  title: 'CochiLoco – Cera Premium para Camiones',
  description: 'CochiLoco ofrece cera profesional de alto rendimiento para acabados espejo, protección extrema y brillo duradero para tu camión.',
  generator: 'v0.app',
  icons: {
    icon: 'logo.jpeg',
    shortcut: 'logo.jpeg',
    apple: 'logo.jpeg',
  },
}

export const viewport: Viewport = {
  themeColor: '#181112',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${_inter.variable} ${_oswald.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
