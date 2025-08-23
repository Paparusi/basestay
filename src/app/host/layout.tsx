import ClientWrapper from './ClientWrapper'

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientWrapper>
      {children}
    </ClientWrapper>
  )
}
