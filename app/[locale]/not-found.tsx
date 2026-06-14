import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-6">
        <p className="text-8xl font-black text-brand/20 leading-none select-none">404</p>
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for does not exist or has been moved.
        Let us take you back to safety.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="bg-brand text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm"
        >
          Go to Homepage
        </Link>
        <Link
          href="/dashboard"
          className="border border-border bg-white text-foreground font-semibold px-6 py-2.5 rounded-xl hover:bg-muted transition-colors text-sm"
        >
          My Dashboard
        </Link>
      </div>
    </div>
  );
}
