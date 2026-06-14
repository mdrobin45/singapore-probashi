import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <header className="py-5 px-6">
        <Link href="/" className="inline-block">
          <Image src="/logo.png" alt="Singapur Probashi" width={160} height={50} className="h-10 w-auto" priority />
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground">
        © 2025 Singapur Probashi Community Platform
      </footer>
    </div>
  );
}
