import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/critical.css";
import { Web3Provider } from '@/components/web3/Web3Provider'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: "BaseStay - Decentralized Booking on Base",
  description: "Book accommodations worldwide with USDC on Base blockchain. Secure, transparent, and instant bookings powered by smart contracts.",
  keywords: "crypto booking, USDC payments, Base blockchain, decentralized travel, Web3 accommodation",
  authors: [{ name: "BaseStay Team" }],
  creator: "BaseStay",
  publisher: "BaseStay",
  metadataBase: new URL('https://basestay.io'),
  openGraph: {
    type: 'website',
    siteName: 'BaseStay',
    title: 'BaseStay - Decentralized Booking Platform',
    description: 'Book accommodations with USDC on Base blockchain',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BaseStay - Decentralized Booking Platform',
    description: 'Book accommodations with USDC on Base blockchain',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Base Account SDK */}
        <script 
          src="https://unpkg.com/@base-org/account/dist/base-account.min.js"
          async
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
