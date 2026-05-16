export const metadata = {
  title: 'Souq Pro | Sanity Studio',
  description: 'Manage Souq Pro content',
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
