// Root layout — minimal passthrough.
// The [locale]/layout.tsx nested layout provides <html> and <body>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
