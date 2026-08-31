import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 no-underline">
        <span
          className="flex items-center justify-center size-8 rounded-[var(--radius-md)] text-white text-[0.75rem] font-bold tracking-wide"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          NFC
        </span>
        <span className="font-semibold text-[0.9375rem] tracking-tight text-[var(--color-fg)]">
          Smart Profile
        </span>
      </Link>

      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
