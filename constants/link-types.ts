import {
  Instagram,
  Music2,
  MessageCircle,
  Globe,
  Youtube,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Link,
  type LucideIcon,
} from "lucide-react";
import type { LinkType } from "@/types";

export interface LinkTypeConfig {
  type: LinkType;
  label: string;
  icon: LucideIcon;
  placeholder: string;
  prefix?: string;
}

export const LINK_TYPES: LinkTypeConfig[] = [
  {
    type: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "https://instagram.com/username",
    prefix: "https://instagram.com/",
  },
  {
    type: "tiktok",
    label: "TikTok",
    icon: Music2,
    placeholder: "https://tiktok.com/@username",
    prefix: "https://tiktok.com/@",
  },
  {
    type: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    placeholder: "https://wa.me/628123456789",
    prefix: "https://wa.me/",
  },
  {
    type: "website",
    label: "Website",
    icon: Globe,
    placeholder: "https://yourwebsite.com",
  },
  {
    type: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "https://youtube.com/@channel",
    prefix: "https://youtube.com/@",
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "https://linkedin.com/in/username",
    prefix: "https://linkedin.com/in/",
  },
  {
    type: "email",
    label: "Email",
    icon: Mail,
    placeholder: "mailto:you@example.com",
    prefix: "mailto:",
  },
  {
    type: "phone",
    label: "Phone",
    icon: Phone,
    placeholder: "tel:+628123456789",
    prefix: "tel:",
  },
  {
    type: "maps",
    label: "Google Maps",
    icon: MapPin,
    placeholder: "https://maps.google.com/?q=...",
  },
  {
    type: "shopee",
    label: "Shopee",
    icon: ShoppingBag,
    placeholder: "https://shopee.co.id/...",
  },
  {
    type: "tokopedia",
    label: "Tokopedia",
    icon: ShoppingBag,
    placeholder: "https://tokopedia.com/...",
  },
  {
    type: "custom",
    label: "Custom Link",
    icon: Link,
    placeholder: "https://...",
  },
];

export const LINK_TYPE_MAP = Object.fromEntries(
  LINK_TYPES.map((lt) => [lt.type, lt])
) as Record<LinkType, LinkTypeConfig>;

export function getLinkIcon(type: string): LucideIcon {
  return LINK_TYPE_MAP[type as LinkType]?.icon ?? Link;
}
