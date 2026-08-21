import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const description =
  'Colby Ryan is a Software Engineer at Panoramix Financial in New York City, building AI-powered financial tooling.'

export const metadata: Metadata = {
  metadataBase: new URL('https://colbyryan.com'),
  title: {
    default: 'Colby Ryan — Software Engineer',
    template: '%s · Colby Ryan',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Colby Ryan — Software Engineer',
    description,
    url: 'https://colbyryan.com',
    siteName: 'Colby Ryan',
    images: ['/images/headshot.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Colby Ryan — Software Engineer',
    description,
    images: ['/images/headshot.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Nav />
          <main className="mx-auto max-w-4xl px-6 py-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
