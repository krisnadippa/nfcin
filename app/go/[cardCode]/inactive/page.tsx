import Link from "next/link";
import { Nfc } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ cardCode: string }>;
}

export default async function CardInactivePage({ params }: Props) {
  const { cardCode } = await params;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      <div className="surface p-8 max-w-sm w-full text-center">
        <div
          className="mx-auto mb-5 flex items-center justify-center size-12 rounded-[var(--radius-lg)] border"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
          }}
        >
          <Nfc size={22} strokeWidth={1.5} style={{ color: "var(--color-muted)" }} />
        </div>
        <h1 className="text-subheading mb-2">Card Not Active</h1>
        <p className="text-body mb-2">
          The NFC card <span className="font-mono font-medium">{cardCode}</span>{" "}
          has not been configured yet.
        </p>
        <p className="text-caption mb-6">
          If this is your card, scan the activation QR code to set it up.
        </p>
        <Link href={`/activate/${cardCode}`}>
          <Button variant="secondary" fullWidth>
            Activate Card
          </Button>
        </Link>
      </div>
    </div>
  );
}
