"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCardIdByCodeAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Nfc, AlertCircle, CheckCircle2, Loader2, Smartphone } from "lucide-react";

export function ScanClient() {
  const router = useRouter();
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "reading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [cardCodeInput, setCardCodeInput] = useState("");
  const [manualError, setManualError] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  useEffect(() => {
    // Check Web NFC API support
    if (typeof window !== "undefined") {
      setIsSupported("NDEFReader" in window);
    }
  }, []);

  const startScan = async () => {
    if (!("NDEFReader" in window)) {
      setStatus("error");
      setMessage("Web NFC is not supported on this browser/device.");
      return;
    }

    try {
      setStatus("scanning");
      setMessage("Dekatkan kartu NFC ke bagian belakang HP Anda...");

      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("readingerror", () => {
        setStatus("error");
        setMessage("Gagal membaca tag NFC. Silakan coba lagi.");
      });

      ndef.addEventListener("reading", async ({ message: ndefMessage }: any) => {
        setStatus("reading");
        setMessage("Membaca data kartu...");

        let cardCode = "";

        for (const record of ndefMessage.records) {
          if (record.recordType === "url") {
            const decoder = new TextDecoder();
            const url = decoder.decode(record.data);
            
            // Extract code from URL matching format NFC-XXXXXX
            const match = url.match(/NFC-[A-Z0-9]{4,8}/i);
            if (match) {
              cardCode = match[0].toUpperCase();
              break;
            }
          } else if (record.recordType === "text") {
            const decoder = new TextDecoder();
            const text = decoder.decode(record.data);
            const match = text.match(/NFC-[A-Z0-9]{4,8}/i);
            if (match) {
              cardCode = match[0].toUpperCase();
              break;
            }
          }
        }

        if (!cardCode) {
          setStatus("error");
          setMessage("Data NFC tidak dikenali. Pastikan kartu berisi format URL dengan kode NFC-XXXXXX.");
          return;
        }

        handleCardCodeFound(cardCode);
      });

    } catch (error: any) {
      console.error("NFC Scan error:", error);
      setStatus("error");
      setMessage(error.message || "Gagal mengaktifkan sensor NFC. Pastikan NFC aktif di HP Anda.");
    }
  };

  const handleCardCodeFound = async (code: string) => {
    try {
      const res = await getCardIdByCodeAction(code);
      if (res.error) {
        setStatus("error");
        setMessage(`Kartu ${code} tidak terdaftar di sistem.`);
        return;
      }
      if (res.id) {
        setStatus("success");
        setMessage(`Kartu ${code} terdeteksi! Mengalihkan ke halaman detail...`);
        setTimeout(() => {
          router.push(`/admin/cards/${res.id}`);
        }, 1500);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Terjadi kesalahan koneksi ke server.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardCodeInput.trim()) return;

    setManualLoading(true);
    setManualError("");
    try {
      const code = cardCodeInput.trim().toUpperCase();
      const res = await getCardIdByCodeAction(code);
      if (res.error) {
        setManualError(res.error);
      } else if (res.id) {
        router.push(`/admin/cards/${res.id}`);
      }
    } catch (err) {
      setManualError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.4); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.1); opacity: 0; }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.05); }
          100% { transform: scale(0.9); }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }
      `}</style>

      <div>
        <h2 className="text-heading text-center lg:text-left">NFC Scanner</h2>
        <p className="text-body text-center lg:text-left mt-0.5">
          Scan kartu NFC fisik langsung menggunakan HP atau masukkan kodenya secara manual.
        </p>
      </div>

      {/* Main scanner display */}
      <div className="surface p-8 flex flex-col items-center justify-center text-center gap-6 relative overflow-hidden min-h-[320px]">
        {status === "idle" && (
          <>
            <div className="size-20 rounded-full bg-[var(--color-bg)] flex items-center justify-center text-[var(--color-muted)]">
              <Nfc size={36} />
            </div>
            <div>
              <p className="text-label font-semibold">Siap Memindai</p>
              <p className="text-caption mt-1 max-w-[280px] mx-auto">
                {isSupported 
                  ? "Klik tombol di bawah untuk mengaktifkan pemindai NFC pada HP Anda." 
                  : "Web NFC tidak didukung di perangkat ini. Gunakan Chrome di Android, atau input manual di bawah."}
              </p>
            </div>
            {isSupported && (
              <Button onClick={startScan} size="lg" className="w-full sm:w-auto">
                Mulai Scan NFC
              </Button>
            )}
          </>
        )}

        {status === "scanning" && (
          <>
            <div className="relative size-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-pulse-ring" style={{ opacity: 0.15 }}></div>
              <div className="absolute inset-4 rounded-full bg-[var(--color-primary)] animate-pulse-ring" style={{ animationDelay: "0.6s", opacity: 0.15 }}></div>
              <div className="relative size-16 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shadow-lg animate-pulse-dot">
                <Nfc size={28} />
              </div>
            </div>
            <div>
              <p className="text-label font-semibold text-[var(--color-primary)]">Mencari Kartu NFC...</p>
              <p className="text-caption mt-2 max-w-[300px] mx-auto">
                {message || "Dekatkan bagian belakang HP Anda ke kartu NFC."}
              </p>
            </div>
            <Button variant="ghost" onClick={() => setStatus("idle")}>
              Batal
            </Button>
          </>
        )}

        {status === "reading" && (
          <>
            <div className="size-20 rounded-full bg-[var(--color-primary-bg)] text-[var(--color-primary)] flex items-center justify-center relative">
              <Loader2 className="animate-spin" size={32} />
            </div>
            <div>
              <p className="text-label font-semibold">Sedang Membaca...</p>
              <p className="text-caption mt-1">{message}</p>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="size-20 rounded-full bg-[var(--color-success-bg)] text-[var(--color-success)] flex items-center justify-center">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <p className="text-label font-semibold text-[var(--color-success)]">Scan Berhasil!</p>
              <p className="text-caption mt-1">{message}</p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="size-20 rounded-full bg-[var(--color-danger-bg)] text-[var(--color-danger)] flex items-center justify-center">
              <AlertCircle size={40} />
            </div>
            <div>
              <p className="text-label font-semibold text-[var(--color-danger)]">Scan Gagal</p>
              <p className="text-caption mt-1 max-w-[280px] mx-auto">{message}</p>
            </div>
            <div className="flex gap-2 w-full justify-center">
              {isSupported && (
                <Button onClick={startScan}>
                  Coba Lagi
                </Button>
              )}
              <Button variant="ghost" onClick={() => setStatus("idle")}>
                Kembali
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Manual lookup input */}
      <div className="surface p-6 flex flex-col gap-4">
        <div>
          <p className="text-label">Input Kode Manual</p>
          <p className="text-caption mt-0.5">
            Gunakan jika sensor NFC tidak merespon atau Anda sedang menggunakan komputer.
          </p>
        </div>

        {manualError && (
          <div
            className="rounded-[var(--radius-md)] border p-3 text-[0.8125rem]"
            style={{
              borderColor: "#FECACA",
              backgroundColor: "var(--color-danger-bg)",
              color: "var(--color-danger)",
            }}
          >
            {manualError}
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              label="Kode Kartu (e.g. NFC-XXXXXX)"
              placeholder="NFC-XXXXXX"
              value={cardCodeInput}
              onChange={(e) => setCardCodeInput(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={manualLoading} className="shrink-0">
            Cari Kartu
          </Button>
        </form>
      </div>

      {/* Instruction Box */}
      <div className="surface p-5 flex gap-3 items-start">
        <Smartphone size={20} className="text-[var(--color-muted)] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 text-caption">
          <p className="font-medium text-[var(--color-fg)]">Tips Membaca NFC:</p>
          <p>1. Aktifkan fitur NFC di pengaturan HP Anda.</p>
          <p>2. Gunakan browser Google Chrome (Android).</p>
          <p>3. Letakkan kartu NFC di dekat posisi sensor (biasanya di bagian belakang atas atau tengah HP).</p>
          <p>4. Untuk iOS, silakan tap langsung kartu NFC saat di layar utama HP Anda (bukan di dalam browser) untuk membuka link secara otomatis.</p>
        </div>
      </div>
    </div>
  );
}
