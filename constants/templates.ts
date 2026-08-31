import {
  LayoutList,
  User,
  Building2,
  FileText,
  Briefcase,
  type LucideIcon,
} from "lucide-react";
import type { ProfileTemplate } from "@/types";

export interface TemplateConfig {
  id: ProfileTemplate;
  label: string;
  description: string;
  icon: LucideIcon;
  fields: string[];
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: "linktree",
    label: "Linktree",
    description: "A simple link hub with all your important links in one place.",
    icon: LayoutList,
    fields: ["name", "username", "bio"],
  },
  {
    id: "personal",
    label: "Personal Branding",
    description: "Showcase who you are with your profession and online presence.",
    icon: User,
    fields: ["name", "username", "bio", "profession"],
  },
  {
    id: "company",
    label: "Company Profile",
    description: "A professional page for your business or brand.",
    icon: Building2,
    fields: ["company_name", "username", "bio", "industry", "location", "website_url"],
  },
  {
    id: "cv",
    label: "CV / Resume",
    description: "A digital resume that opens when someone taps your card.",
    icon: FileText,
    fields: ["name", "username", "bio", "profession"],
  },
  {
    id: "portfolio",
    label: "Portfolio",
    description: "Display your work, projects, and creative output.",
    icon: Briefcase,
    fields: ["name", "username", "bio", "profession"],
  },
];

export const TEMPLATE_MAP = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t])
) as Record<ProfileTemplate, TemplateConfig>;

export const ACTION_TYPE_OPTIONS = [
  {
    value: "profile" as const,
    label: "Open My Profile",
    description: "Show your digital profile page.",
  },
  {
    value: "instagram" as const,
    label: "Open Instagram",
    description: "Go directly to your Instagram profile.",
  },
  {
    value: "whatsapp" as const,
    label: "Open WhatsApp",
    description: "Start a WhatsApp chat instantly.",
  },
  {
    value: "website" as const,
    label: "Open Website",
    description: "Redirect to any website.",
  },
  {
    value: "tiktok" as const,
    label: "Open TikTok",
    description: "Go to your TikTok profile.",
  },
  {
    value: "youtube" as const,
    label: "Open YouTube",
    description: "Go to your YouTube channel.",
  },
  {
    value: "linkedin" as const,
    label: "Open LinkedIn",
    description: "Go to your LinkedIn profile.",
  },
  {
    value: "custom" as const,
    label: "Open Custom URL",
    description: "Redirect to any URL you specify.",
  },
];
