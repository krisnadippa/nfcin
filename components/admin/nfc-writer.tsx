"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Nfc, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface NfcWriterProps {
  nfcUrl: string;
  cardCode: string;
}

export function NfcWriter({ nfcUrl, cardCode }: NfcWriterProps) {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "writing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported("NDEFReader" in window);
    }
  }, []);

  const handleWrite = async () => {
    if (!("NDEFReader" in window)) {
      setStatus("error");
      setMessage("Web NFC tidak didukung di perangkat/browser ini.");
      return;
    }

    try {
      setStatus("writing");
      setMessage("Dekatkan kartu NFC kosong ke belakang HP Anda...");

      const ndef = new (window as any).NDEFReader();
      // Write the URL record to the NFC Tag
      await ndef.write({
        records: [{ recordType: "url", data: nfcUrl }]
      });

      setStatus("success");
      setMessage(`Berhasil menulis URL ke kartu ${cardCode}!`);
      
      // Reset back to idle after a few seconds
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    } catch (error: any) {
      console.error("NFC Write error:", error);
      setStatus("error");
      setMessage(error.message || "Gagal menulis ke kartu NFC. Coba dekatkan ulang.");
    }
  };

  if (!isSupported) {
    return null; // Don't show the button if Web NFC is not supported (e.g. desktop/iOS)
  }

  return (
    <div className="surface p-5 flex flex-col gap-4">
      <style>{`
        @keyframes pulse-ring-write {
          0% { transform: scale(0.6); opacity: 0; }
          50% { opacity: 0.4; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        .animate-pulse-write {
          animation: pulse-ring-write 1.5s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
      `}</style>
      
      <div>
        <p className="text-label font-semibold">Tulis ke Kartu NFC Fisik</p>
        <p className="text-caption mt-0.5">
          Tulis URL sistem ini langsung ke kartu NFC kosong Anda melalui sensor HP.
        </p>
      </div>

      {status === "idle" && (
        <Button onClick={handleWrite} className="w-full flex items-center justify-center gap-2">
          <Nfc size={16} />
          Mulai Tulis ke Kartu NFC
        </Button>
      )}

      {status === "writing" && (
        <div className="flex flex-col items-center justify-center p-4 border rounded-lg border-dashed border-[var(--color-primary)] bg-[var(--color-primary-bg)] gap-3">
          <div className="relative size-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-pulse-write"></div>
            <div className="relative size-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
              <Loader2 size={16} className="animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-caption font-semibold text-[var(--color-primary)]">Menunggu Tempelan Kartu...</p>
            <p className="text-[0.75rem] text-[var(--color-muted)] mt-0.5">{message}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
            Batal
          </Button>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg border border-[#BBF7D0] bg-emerald-50/50 text-[var(--color-success)]">
          <CheckCircle2 size={16} className="shrink-0" />
          <div className="text-left">
            <p className="text-caption font-semibold">Berhasil Ditulis!</p>
            <p className="text-[0.75rem] text-[var(--color-success)] opacity-90">{message}</p>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-[#FECACA] bg-red-50/50 text-[var(--color-danger)]">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="shrink-0" />
            <p className="text-caption font-semibold">Gagal Menulis</p>
          </div>
          <p className="text-[0.75rem] leading-relaxed opacity-90">{message}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleWrite} className="px-3">
              Coba Lagi
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setStatus("idle")} className="px-3">
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
