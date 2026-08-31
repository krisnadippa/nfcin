"use client";

import { useEffect, useRef, useState } from "react";
import { generateQRDataUrl } from "@/lib/qr/generator";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  filename: string;
}

export function QRCodeDisplay({ url, filename }: QRCodeDisplayProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    generateQRDataUrl(url).then(setDataUrl);
  }, [url]);


  if (!dataUrl) {
    return (
      <div
        className="size-40 skeleton"
        aria-label="Loading QR code"
      />
    );
  }

  function handleDownload() {
    const link = document.createElement("a");
    link.href = dataUrl!;
    link.download = `${filename}.png`;
    link.click();
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <img
        ref={imgRef}
        src={dataUrl}
        alt={`QR code for ${url}`}
        className="w-40 h-40 border"
        style={{ borderColor: "var(--color-border)" }}
      />
      <Button variant="secondary" size="sm" onClick={handleDownload}>
        <Download size={14} />
        Download PNG
      </Button>
    </div>
  );
}
