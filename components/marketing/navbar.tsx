import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header
      style={{
        backgroundColor: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[var(--color-fg)] no-underline"
          >
            <span
              className="flex items-center justify-center size-8 rounded-[var(--radius-md)] text-white text-[0.75rem] font-bold tracking-wide"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              NFC
            </span>
            <span className="font-semibold text-[0.9375rem] tracking-tight">
              Smart Profile
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/#how-it-works"
              className="text-[0.875rem] text-[var(--color-secondary)] hover:text-[var(--color-fg)] transition-base no-underline"
            >
              How It Works
            </Link>
            <Link
              href="/#use-cases"
              className="text-[0.875rem] text-[var(--color-secondary)] hover:text-[var(--color-fg)] transition-base no-underline"
            >
              Use Cases
            </Link>
            <Link
              href="/pricing"
              className="text-[0.875rem] text-[var(--color-secondary)] hover:text-[var(--color-fg)] transition-base no-underline"
            >
              Pricing
            </Link>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
