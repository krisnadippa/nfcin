"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Nfc } from "lucide-react";

export function ActivateCardForm() {
  const [code, setCode] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code) return;
    
    // Normalize code to uppercase and trim spaces
    const cleanCode = code.trim().toUpperCase();
    
    // Redirect to the activation page for this code
    router.push(`/activate/${cleanCode}`);
  }

  return (
    <div className="surface p-5 flex flex-col gap-4">
      <div>
        <p className="text-label flex items-center gap-1.5">
          <Nfc size={16} strokeWidth={1.5} style={{ color: "var(--color-fg)" }} />
          Activate Card Manually
        </p>
        <p className="text-caption mt-0.5">
          Got a physical card? Type the card code (e.g. NFC-8X29A7) to set it up.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            placeholder="NFC-XXXXXX"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="uppercase"
          />
        </div>
        <Button type="submit" disabled={!code.trim()}>
          Next
        </Button>
      </form>
    </div>
  );
}
