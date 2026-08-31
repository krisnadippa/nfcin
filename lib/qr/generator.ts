import QRCode from "qrcode";

/**
 * Generates a QR code as a data URL (PNG) for the given content.
 */
export async function generateQRDataUrl(
  content: string,
  size: number = 300
): Promise<string> {
  return QRCode.toDataURL(content, {
    width: size,
    margin: 2,
    color: {
      dark: "#171717",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}

/**
 * Generates a QR code as an SVG string.
 */
export async function generateQRSvg(content: string): Promise<string> {
  return QRCode.toString(content, {
    type: "svg",
    margin: 2,
    color: {
      dark: "#171717",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}
