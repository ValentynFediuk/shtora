import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'SHTORA - Інтернет-магазин штор та текстилю',
  description: 'Великий вибір штор, тюлів, карнизів та домашнього текстилю. Доставка по всій Україні.',
  keywords: ['штори', 'тюль', 'карнизи', 'текстиль', 'інтернет-магазин', 'Україна'],
  openGraph: {
    title: 'SHTORA - Інтернет-магазин штор та текстилю',
    description: 'Великий вибір штор, тюлів, карнизів та домашнього текстилю',
    locale: 'uk_UA',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
