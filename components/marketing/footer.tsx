import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
      }}
    >
      <div className="container-page py-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span
                className="flex items-center justify-center size-7 rounded-[var(--radius-sm)] text-white text-[0.6875rem] font-bold tracking-wide"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                NFC
              </span>
              <span className="font-semibold text-[0.875rem] tracking-tight text-[var(--color-fg)]">
                Smart Profile
              </span>
            </div>
            <p className="text-caption max-w-xs">
              Connect your NFC card to any digital destination. One card, unlimited possibilities.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <p className="text-label mb-3">Product</p>
              <ul className="flex flex-col gap-2">
                {[
                  { href: "/#how-it-works", label: "How It Works" },
                  { href: "/#use-cases", label: "Use Cases" },
                  { href: "/pricing", label: "Pricing" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-caption hover:text-[var(--color-fg)] transition-base no-underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-label mb-3">Account</p>
              <ul className="flex flex-col gap-2">
                {[
                  { href: "/login", label: "Log in" },
                  { href: "/register", label: "Get Started" },
                  { href: "/dashboard", label: "Dashboard" },
                ].map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-caption hover:text-[var(--color-fg)] transition-base no-underline"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <p className="text-caption">
            &copy; {year} NFC Smart Profile. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
