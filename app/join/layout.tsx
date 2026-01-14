import { Noto_Sans_JP } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className={notoSansJP.variable}>{children}</div>
}
