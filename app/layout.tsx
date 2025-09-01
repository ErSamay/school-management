import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'School Management System',
  description: 'Manage and view schools data',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              School Management
            </Link>
            <div className="space-x-4">
              <Link href="/schools" className="hover:text-blue-200">
                View Schools
              </Link>
              <Link href="/add-school" className="hover:text-blue-200">
                Add School
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}